# HomeIQ — Study Guide

---

## Section 1: HomeIQ Project Specifics

### Q: What type of architecture does HomeIQ currently use?

**A:** A monolithic Flask application with synchronous request handling, deployed on Heroku via Gunicorn, using a file-based database (SQLite).

---

### Q: What are the 5 backend endpoints in HomeIQ?

**A:**

| # | Endpoint | Purpose |
|---|----------|---------|
| 1 | `POST /fetch-and-enrich` | Fetch EPC data + enrich with location data |
| 2 | `POST /predict-price` | ML price prediction with SHAP |
| 3 | `POST /feasibility` | Mortgage affordability assessment |
| 4 | `POST /recommendations` | Similar property recommendations |
| 5 | `GET /enhanced_search` | Advanced property search with filters |

---

### Q: What database does HomeIQ use and what are its 5 tables?

**A:** SQLite with 5 tables:

| Table | Key Columns |
|-------|-------------|
| **House** | 110 columns — price, address, energy, building, location, amenities |
| **School** | name, postcode, ofsted rating, lat/lon |
| **Shop** | store name, size band, lat/lon |
| **TransportStop** | stop name, type (RSE/B), lat/lon |
| **PostcodeLocation** | postcode → lat/lon mapping |

---

### Q: How does HomeIQ's data enrichment work (`data_enricher.py`)?

**A:** Uses scipy's `cKDTree` for **O(log n)** spatial nearest-neighbor queries. Lazily loads all schools, shops, and transport stops into memory on first call. Builds separate KDTrees for each entity type. Uses `geopy` geodesic distance for accurate distance calculation.

---

### Q: How does HomeIQ's price prediction pipeline work?

**A:**

```
Load model artifacts (joblib)
        │
        ▼
Calculate local_avg_price via KDTree (50 nearest training samples)
        │
        ▼
Encode categorical features with LabelEncoders
        │
        ▼
Predict price with trained ML model
        │
        ▼
Generate SHAP values for per-prediction feature importance
        │
        ▼
Return prediction + explanation
```

> ⚠️ **Bottleneck:** SHAP computation takes 1–2 seconds per request.

---

### Q: How does HomeIQ's affordability filter work in `/enhanced_search`?

**A:** Loops through **ALL** matching houses and calls `get_feasibility()` for each one — **O(N) complexity**. Uses hardcoded system inputs (30-year term, 3.5% rate). Checks:

- DTI ratio < 36%
- Mortgage-to-income ≤ 4.5×
- LTV ≤ 95%

> ⚠️ **Major bottleneck** — evaluates every property even for paginated results.

---

### Q: What is HomeIQ's frontend stack and state management approach?

**A:** React 19 SPA with React Router 7, Material-UI 6.4, Tailwind CSS, Chart.js. Uses **no global state management** (no Redux/Context). Relies on `localStorage` for persistence (financial data, recent searches) and component-level `useState`/`useEffect` hooks.

---

### Q: What external APIs does HomeIQ depend on?

**A:**

1. **EPC OpenData API** — fetches Energy Performance Certificates via HTTP Basic Auth, returns CSV, called synchronously per property lookup (not cached)
2. **Ideal Postcodes API** — frontend address autocomplete from UK postcodes (API key exposed in client-side code)

---

### Q: What are the 7 critical bottlenecks identified in HomeIQ?

**A:**

1. SQLite single-writer lock (no concurrent access)
2. Synchronous SHAP computation (1–2s per prediction)
3. No caching layer (every request hits DB + compute)
4. Single-instance monolith (can't scale horizontally)
5. Uncached EPC API dependency (latency + availability coupling)
6. No CDN or code splitting (large initial bundle)
7. No auth or rate limiting (vulnerable to abuse)

---

### Q: Why can't HomeIQ scale horizontally in its current form?

**A:** Three reasons:

1. **SQLite is file-local** — multiple instances can't share it
2. **In-memory caches** (KDTree, ML models) are process-local global variables
3. **No shared state layer** exists between instances

All state is trapped inside a single process.

---

### Q: What is HomeIQ's read/write traffic split?

**A:** ~**90%+ reads**, <10% writes. Search, predictions, recommendations, and feasibility are all reads over existing data. Only `/fetch-and-enrich` performs writes (fetching new EPC data).

> 💡 This means **aggressive caching is the single highest-ROI optimisation**.

---

## Section 2: Database Scaling Concepts

### Q: Why is a file-based database (like SQLite) unsuitable for high concurrency?

**A:** It uses a **single-writer lock** — only one write can happen at a time across the entire database. Reads can be blocked by write locks. No connection pooling. Cannot be shared across multiple server instances. Designed for embedded/single-process use, not network-accessible multi-client scenarios.

---

### Q: What is connection pooling and why does it matter?

**A:** A pool of pre-established database connections shared across requests. Without it, each request opens/closes a connection (expensive handshake). With it, connections are reused, reducing overhead.

- Typical pool size: **20–100 connections**
- Critical for high-throughput applications

---

### Q: What are read replicas and when should you use them?

**A:** Copies of the primary database that receive replicated writes and serve read queries. Use them when read load exceeds what a single database server can handle.

- **Tradeoff:** introduces replication lag (eventual consistency)
- For HomeIQ, **not needed until reads alone exceed single-server capacity** — caching should be tried first

---

### Q: What is the tradeoff between vertical and horizontal database scaling?

**A:**

| | Vertical | Horizontal |
|---|----------|-----------|
| **Approach** | Bigger server (more CPU/RAM) | More servers (replicas, sharding) |
| **Pros** | Simple, no code changes | Near-linear scaling, cost-efficient |
| **Cons** | Has a ceiling, expensive at scale | Adds complexity (replication lag, routing) |

---

### Q: What database indexes would you add for a property search application?

**A:** Index columns used in `WHERE` clauses and `JOIN`s:

- `postcode` (prefix search)
- `predicted_price` (range filter)
- `property_type` (equality filter)
- `town_city` (equality filter)

Compound indexes for common combinations: `(property_type, predicted_price)`, `(postcode, predicted_price)`.

> ⚠️ Indexes speed reads but slow writes and use storage.

---

## Section 3: Caching Concepts

### Q: What is the caching pyramid (from fastest to slowest)?

**A:**

```
┌─────────────────────────────────┐
│    CDN / Edge Cache  (<5ms)     │  ← Static assets, closest to user
├─────────────────────────────────┤
│   Application Cache  (<10ms)    │  ← API responses, shared across instances
├─────────────────────────────────┤
│   In-Process Cache   (<1ms)     │  ← ML models, reference data, per-instance
├─────────────────────────────────┤
│    Database Cache   (1–50ms)    │  ← Query cache, buffer pool
├─────────────────────────────────┤
│   Source of Truth   (slowest)   │  ← Database tables, external APIs
└─────────────────────────────────┘
```

---

### Q: What is the Cache-Aside (Lazy Loading) pattern?

**A:**

```
        Request arrives
             │
             ▼
     ┌───────────────┐
     │  Check cache   │
     └───────┬───────┘
        HIT? │
       ┌─────┴─────┐
       │           │
      YES          NO
       │           │
       ▼           ▼
   Return     Compute / Fetch
   cached     from source
   value           │
                   ▼
              Store in cache
              (with TTL)
                   │
                   ▼
              Return value
```

- Simple, widely used
- **Tradeoff:** first request is always slow (cold cache)
- Can combine with write-through for frequently-written data

---

### Q: What is the difference between coarse-grained and fine-grained caching?

**A:**

| | Coarse-grained | Fine-grained |
|---|---------------|-------------|
| **What** | Entire API responses by URL+params | Individual computations (SHAP per property, coords per postcode) |
| **Pros** | Simple, high hit rate for repeated queries | Composable, higher overall hit rate |
| **Cons** | Any parameter change = miss | More complex to assemble responses |

> 💡 Start coarse, add fine-grained for expensive computations.

---

### Q: How do you decide what TTL (Time-To-Live) to set for cached data?

**A:** Based on how frequently data changes and tolerance for staleness:

| Data | TTL | Reason |
|------|-----|--------|
| EPC data | 24h | Changes rarely |
| Price predictions | Until model retraining | Deterministic |
| Search results | 5–15 min | Acceptable staleness |
| Postcode coordinates | 30 days | Postcodes don't move |
| Static assets | 1 year (with content hash) | Immutable |

---

### Q: What are the main cache invalidation strategies?

**A:**

1. **TTL-based** — Cache expires after a fixed time. Simple but may serve stale data or evict too early.
2. **Event-driven** — Invalidate on specific events (model retrained → clear predictions). Precise but requires event infrastructure.
3. **Write-through** — Update cache on every write. Always fresh but adds write latency.

> ✅ **Best practice:** Event-driven invalidation with TTL as a safety net.

---

### Q: What is a cache stampede and how do you prevent it?

**A:** When a popular cache key expires, many concurrent requests simultaneously try to recompute and write it — **overwhelming the backend**.

**Prevention strategies:**

1. **Locking** — Only one request recomputes; others wait
2. **Early expiry** — Refresh before TTL expires
3. **Stale-while-revalidate** — Serve stale data while one request refreshes in the background

---

## Section 4: Compute & ML Serving Concepts

### Q: Why is SHAP computation expensive and how can you optimise it?

**A:** SHAP evaluates the model across many feature permutations to explain each prediction — **O(n_features × n_background_samples)**.

**Solutions:**

1. **Precompute** in batch jobs, serve from cache
2. **Async** — return price immediately, compute SHAP in background
3. **Simplify** — use tree-native feature importance (O(1), already computed during training) as a lighter alternative

---

### Q: What is a task queue and when should you use one?

**A:** A message-based system where API servers enqueue work and separate worker processes execute it asynchronously.

**Use when:**

- Work is too slow for a synchronous response (>1s)
- Work can be deferred (user doesn't need result immediately)
- Work is CPU-intensive and would block request threads

**Pattern:**

```
Client  ──▶  API Server  ──▶  Task Queue  ──▶  Worker
  │              │                                 │
  │         returns job_id                    processes job
  │              │                                 │
  ◀──────────────┘                                 │
  │                                                │
  │◀───── polls or receives push notification ─────┘
```

---

### Q: How do you handle an O(N) computation in a paginated API?

**A:** Don't compute for all N results — only for the current page. For HomeIQ's affordability filter:

1. **Precompute** — store affordability flags as indexed DB columns for common income brackets
2. **Paginate first, then compute** — only run feasibility for the current page's results
3. **Materialised view** — batch job pre-filters affordable properties per bracket

---

## Section 5: Horizontal Scaling Concepts

### Q: What must you do to make an application horizontally scalable?

**A:** Extract all state that prevents running multiple instances:

```
                    ┌──────────────┐
                    │ Load Balancer│
                    └──────┬───────┘
               ┌───────────┼───────────┐
               ▼           ▼           ▼
         ┌──────────┐┌──────────┐┌──────────┐
         │Instance 1││Instance 2││Instance 3│  ← Stateless
         └────┬─────┘└────┬─────┘└────┬─────┘
              │           │           │
    ┌─────────┴───────────┴───────────┴────────┐
    │                                          │
    ▼                                          ▼
┌─────────────────┐                ┌───────────────────┐
│  Shared Database │                │ Distributed Cache  │
│  (not file-local)│                │ (not process-local)│
└─────────────────┘                └───────────────────┘
```

1. Move database to a shared server (not file-local)
2. Move caches to a distributed cache (not process-local globals)
3. Move background work to a shared task queue
4. Make each instance **stateless** — any instance can handle any request

---

### Q: What is the tradeoff between a scaled monolith and microservices?

**A:**

| | Scaled Monolith | Microservices |
|---|----------------|--------------|
| **Pros** | Lower complexity, faster to develop, shared deployment | Independent scaling, deployment, and tech choices |
| **Cons** | All components scale together | Adds distributed systems complexity, network latency, ops overhead |
| **When** | Default choice up to ~10K RPS | When services have significantly divergent scaling needs |

---

### Q: When should you decompose a monolith into microservices?

**A:** When you observe:

1. Different endpoints have **vastly different scaling needs**
2. Teams need to **deploy independently**
3. Different components need **different technology stacks**
4. **Failure isolation** is critical (ML crash shouldn't break search)

> 💡 Don't decompose prematurely — a well-cached, horizontally scaled monolith handles 10K+ RPS with far less complexity.

---

### Q: What is auto-scaling and what metrics should trigger it?

**A:** Automatically adjusting the number of running instances based on load.

| Metric | Scale Up Threshold |
|--------|--------------------|
| CPU utilisation | > 70% |
| Memory utilisation | > 80% |
| Request queue depth | Growing |
| Response latency (p99) | > threshold |

Scale down when metrics fall below thresholds (with **cooldown** to prevent flapping).

---

## Section 6: External API Resilience

### Q: What is the Circuit Breaker pattern?

**A:** A resilience pattern with 3 states:

```
                    ┌──────────┐
          success   │  CLOSED  │  ← Normal operation
          ┌────────▶│(pass-thru)│
          │         └────┬─────┘
          │              │ N failures
          │              ▼
          │         ┌──────────┐
          │         │   OPEN   │  ← Fast-fail, return
          │         │(fallback)│    cached/default response
          │         └────┬─────┘
          │              │ timeout expires
          │              ▼
          │         ┌──────────┐
          └─────────│HALF-OPEN │  ← Allow 1 test request
           success  │ (probe)  │
                    └────┬─────┘
                         │ failure
                         ▼
                    Back to OPEN
```

Prevents cascading failures when an external dependency is down.

---

### Q: What problems does an uncached external API dependency cause at scale?

**A:**

1. **Latency coupling** — your response time = your processing + their latency + network variance
2. **Availability coupling** — if they go down, your endpoint fails
3. **Rate limit risk** — you may hit their quotas under high load
4. **Amplification** — 1,000 users = 1,000 external calls/second

> ✅ **Solution:** Cache responses + circuit breaker + consider background sync.

---

### Q: What is the difference between cache-through and background sync for external APIs?

**A:**

| | Cache-Through | Background Sync |
|---|-------------|-----------------|
| **How** | On cache miss → call API → cache → return | Batch job periodically fetches data → stores locally |
| **Hot path** | First request has full external latency | Never calls external API (always fast) |
| **Tradeoff** | Simpler | More storage, need sync mechanism, slightly stale data |
| **Best for** | Low-to-medium throughput | High-throughput systems |

---

## Section 7: Frontend Delivery

### Q: What is code splitting and why does it matter?

**A:** Breaking a single large JavaScript bundle into smaller chunks loaded on demand.

| Metric | Before | After |
|--------|--------|-------|
| Initial load | 1.2 MB | ~200 KB |
| Time to Interactive | 3–5s | < 1.5s |

**Techniques:**

- **Route-based splitting** — each page is a separate chunk
- **Component splitting** — heavy components (charts) loaded when opened

---

### Q: What is a CDN and how does it help with scaling?

**A:** A Content Delivery Network caches static assets at edge nodes globally.

**Benefits:**

- Users served from nearest node (< 20ms vs 200ms+ from origin)
- Offloads traffic from your origin server
- Built-in DDoS protection
- Assets with content hashes can be cached for 1 year (immutable)

> For SPAs: serve JS/CSS/images from CDN, only API calls go to your backend.

---

### Q: What is the difference between CDN edge caching and application-level caching?

**A:**

| | CDN Edge Cache | Application Cache |
|---|---------------|-------------------|
| **What** | Static assets (JS, CSS, images) | Dynamic data (API responses, computed results) |
| **Where** | Geographically distributed edge nodes | Shared cache co-located with backend |
| **Best for** | Static, immutable content | Frequently-requested, slow-to-compute data |

---

## Section 8: Rate Limiting & Auth

### Q: What are the four main rate limiting algorithms?

**A:**

| Algorithm | How It Works | Tradeoff |
|-----------|-------------|----------|
| **Fixed Window** | Count requests per time window (e.g., 100/min) | Simple but allows bursts at window boundaries |
| **Sliding Window** | Smooth counting over a rolling window | Accurate but more memory |
| **Token Bucket** | Tokens added at fixed rate, consumed per request | ✅ Allows controlled bursts — best general-purpose |
| **Leaky Bucket** | Requests processed at fixed rate, excess queued | Perfectly smooth but no burst tolerance |

---

### Q: What is Defence in Depth for API protection?

**A:**

```
═══════════════════════════════════════════
  Layer 1: CDN / WAF
  → DDoS protection, bot filtering
═══════════════════════════════════════════
  Layer 2: API Gateway
  → Authentication, global rate limiting
    (e.g., 100 req/min/IP)
═══════════════════════════════════════════
  Layer 3: App Middleware
  → Per-endpoint rate limits, input validation,
    request size limits
═══════════════════════════════════════════
  Layer 4: Business Logic
  → Authorisation checks, resource limits
═══════════════════════════════════════════
```

---

## Section 9: Capacity Estimation

### Q: How do you do a back-of-envelope capacity estimation for 1,000 concurrent requests?

**A:**

1. Estimate avg request duration: **200ms** (with caching)
2. Throughput = 1,000 × (1000ms / 200ms) = **5,000 RPS**
3. Apply cache hit rate (70%) → backend handles **1,500 RPS**
4. Workers needed = 1,500 × 0.2s = **300 concurrent slots**
5. Instances = workers / workers_per_instance

> **Result:** With async I/O, ~2–3 instances. Without, ~25 instances. Caching is the difference-maker.

---

### Q: What is the impact of cache hit rate on required infrastructure?

**A:** At 5,000 RPS:

| Cache Hit Rate | Backend RPS | Instances Needed |
|---------------|-------------|-----------------|
| 0% | 5,000 | ~25+ |
| 50% | 2,500 | ~12 |
| 70% | 1,500 | ~3 (with async) |
| 90% | 500 | ~1 (with async) |

> 💡 Each 10% improvement in cache hit rate can **halve** your infrastructure needs.

---

### Q: What is the difference between throughput and concurrency?

**A:**

- **Throughput** — total requests processed per unit time (e.g., 5,000 RPS). Measures system *capacity*.
- **Concurrency** — number of requests being processed simultaneously at any instant (e.g., 1,000 concurrent). Measures *parallelism*.

**Relationship:** `Concurrency = Throughput × Avg Latency`

- High throughput + low latency = low concurrency needed
- High latency = more concurrent slots required

---

## Section 10: Interview Strategy

### Q: What is the recommended order for scaling a read-heavy web application?

**A:**

```
1. Database        → Migrate to client-server DB + indexes + connection pooling
       ▼
2. Caching         → Add distributed cache for responses & expensive computations
       ▼
3. Async compute   → Move heavy work off the hot path (task queues, precomputation)
       ▼
4. Horizontal      → Multiple stateless instances behind load balancer
       ▼
5. Read replicas   → Only when single DB can't handle read load after caching
       ▼
6. Microservices   → Only when scaling needs diverge significantly
```

---

### Q: What are the three most impactful changes for HomeIQ specifically?

**A:**

1. **Replace SQLite** with a client-server relational database + proper indexes → removes biggest scaling barrier
2. **Add distributed caching** for EPC responses, predictions, and search results → reduces backend load 3.5× at 70% hit rate
3. **Move SHAP off the hot path** — precompute, make async, or replace with tree-native feature importance → reduces p99 latency from seconds to milliseconds

---

### Q: What key insight should you lead with in a system design interview about this app?

**A:**

> *"This is a read-heavy system — property data changes infrequently, predictions are deterministic, feasibility is pure math. Therefore, **aggressive caching is the single highest-ROI optimisation** before scaling compute or infrastructure."*

Always identify the access pattern (read-heavy vs write-heavy) before proposing solutions.

---

### Q: How should you discuss the monolith vs microservices tradeoff in an interview?

**A:**

> *"At 1,000 concurrent requests, a horizontally scaled monolith is the right choice. It's simpler to operate, debug, and deploy. I'd only decompose into services when I observe different endpoints have significantly divergent scaling needs — for example, if ML inference traffic is 100× search traffic. The crossover point is typically around 10K+ RPS where individual service scaling becomes worthwhile."*

---

## Section 11: Code Snippet Walkthrough

### Q: What does this code do? (`DataProcessingPipelines.ipynb`)

```python
primary_coords = primary_schools[['latitude', 'longitude']].to_numpy()
secondary_coords = secondary_schools[['latitude', 'longitude']].to_numpy()

primary_tree = cKDTree(primary_coords)
secondary_tree = cKDTree(secondary_coords)
```

**A:** Builds two **KDTree** spatial indexes — one for primary schools and one for secondary schools — from their latitude/longitude coordinates.

- **`.to_numpy()`** — converts a pandas DataFrame (or selected columns) into a raw NumPy array, which is the format `cKDTree` requires.
- **`cKDTree(coords)`** — constructs a KDTree from `scipy.spatial`. A KDTree partitions n-dimensional space into regions so that nearest-neighbor lookups are **O(log n)** instead of brute-force O(n). The `c` prefix means it's implemented in C for speed.

Once built, you can call `tree.query(point, k=1)` to find the nearest school to any house in logarithmic time.

---

### Q: What does this code do? (`DataProcessingPipelines.ipynb`)

```python
def find_nearest_school(house_location, school_type):
    if school_type == 'primary':
        distance, index = primary_tree.query(house_location, k=1)
        nearest_school_distance = geodesic(house_location, primary_coords[index]).kilometers
        nearest_school_ofsted = getOfstedRating(primary_schools.iloc[index]['ofstedrating'])
        school_name = primary_schools.iloc[index]['schname']
    # ... (secondary branch similar)
    return nearest_school_distance, nearest_school_ofsted, school_name
```

**A:** Finds the nearest school of a given type to a house and returns its distance, Ofsted rating, and name.

- **`tree.query(point, k=1)`** — queries the KDTree for the `k` nearest neighbors. Returns a tuple of `(distance, index)`. The distance here is Euclidean on raw lat/lon (an approximation used only for ranking).
- **`geodesic(point1, point2).kilometers`** — from `geopy.distance`, calculates the true great-circle distance between two lat/lon points on the Earth's surface in kilometers. More accurate than Euclidean distance for geographic coordinates.
- **`.iloc[index]`** — pandas **integer-location** based indexing. Unlike `.loc[]` which uses labels, `.iloc[]` selects rows by their integer position (0, 1, 2…). Here it retrieves the school at the position returned by the KDTree query.

---

### Q: What does this code do? (`DataProcessingPipelines.ipynb`)

```python
merged_df['nearest_primary_school_distance'], \
merged_df['nearest_primary_school_ofsted_rating'], \
merged_df['primary_school_name'] = zip(
    *merged_df.apply(
        lambda row: find_nearest_school(
            (row['latitude'], row['longitude']), 'primary'
        ), axis=1
    )
)
```

**A:** Enriches every house in the DataFrame with its nearest primary school's distance, Ofsted rating, and name by applying the `find_nearest_school` function row-by-row.

- **`df.apply(func, axis=1)`** — applies a function to each **row** (`axis=1`) of the DataFrame. `axis=0` would apply to each column. Returns a Series of results.
- **`lambda row:`** — an anonymous inline function. Each `row` is a pandas Series representing one row of the DataFrame.
- **`zip(*iterable)`** — the `*` unpacks the list of tuples returned by `apply`, and `zip` transposes them: a list of `(dist, rating, name)` tuples becomes three separate iterables — one for each column. This is a common "unzip" pattern in Python.

---

### Q: What does this code do? (`DataProcessingPipelines.ipynb`)

```python
transformer = pyproj.Transformer.from_crs("EPSG:27700", "EPSG:4326", always_xy=True)

def convert_coordinates(row):
    lon, lat = transformer.transform(row['Easting'], row['Northing'])
    lon = round(lon, 5)
    lat = round(lat, 5)
    return pd.Series({'calculated_longitude': lon, 'calculated_latitude': lat})

coords = transport_df.apply(convert_coordinates, axis=1)
```

**A:** Converts UK transport stop locations from **British National Grid** (Easting/Northing) to **WGS84** (latitude/longitude) — the standard GPS coordinate system.

- **`pyproj.Transformer.from_crs(source, target)`** — creates a coordinate transformer. `EPSG:27700` is the British National Grid (meters-based), `EPSG:4326` is WGS84 (degrees-based, used by GPS).
- **`always_xy=True`** — ensures the input/output order is always (x, y) i.e. (longitude, latitude), avoiding coordinate-order ambiguity.
- **`pd.Series({...})`** — returning a Series from `apply` creates multiple new columns at once, one per key.

---

### Q: What does this code do? (`DataProcessingPipelines.ipynb`)

```python
def convert_age_band_to_years(age_band):
    if pd.isna(age_band) or age_band == 'NO DATA!' or age_band == 'INVALID!':
        return np.nan
    elif isinstance(age_band, str) and '-' in age_band:
        years = re.findall(r'\d{4}', age_band)
        if len(years) == 2:
            start_year, end_year = map(int, years)
        average_year = (start_year + end_year) / 2
    # ... (other branches)
    return 2023 - average_year
```

**A:** Converts EPC construction age band strings (e.g. `"England and Wales: 1950-1966"`) into a numeric **age in years**.

- **`pd.isna(value)`** — checks if a value is `NaN`/`None`. Safer than `value == np.nan` because `NaN != NaN` in floating-point arithmetic.
- **`re.findall(r'\d{4}', string)`** — uses a regular expression to extract all 4-digit numbers (years) from the string. `\d` matches a digit, `{4}` means exactly four.
- **`map(int, years)`** — applies the `int()` function to each element in `years`, converting strings to integers. More concise than a list comprehension.
- **`np.nan`** — NumPy's "Not a Number" constant, used as a missing value marker in DataFrames. Pandas operations like `.dropna()` and `.fillna()` recognise it.

---

### Q: What does this code do? (`2024DataEPCJoin.ipynb`)

```python
combinedEPC = pd.concat([epc22, epc23, epc24], ignore_index=True)

combinedEPC['INSPECTION_DATE'] = pd.to_datetime(combinedEPC['INSPECTION_DATE'])
combinedEPC = combinedEPC.sort_values(by=['INSPECTION_DATE'], ascending=[False])
combinedEPC = combinedEPC.drop_duplicates(subset='UPRN', keep='first')
```

**A:** Combines 3 years of EPC certificate data into one DataFrame, then keeps only the **most recent certificate** for each property.

- **`pd.concat([df1, df2, df3], ignore_index=True)`** — vertically stacks DataFrames (row-wise). `ignore_index=True` resets the index to 0, 1, 2… instead of preserving original indices (which would cause duplicates).
- **`pd.to_datetime()`** — converts a string column to datetime objects, enabling proper chronological sorting.
- **`.sort_values(ascending=[False])`** — sorts most recent first.
- **`.drop_duplicates(subset='UPRN', keep='first')`** — removes duplicate rows based on the `UPRN` (Unique Property Reference Number) column, keeping only the first occurrence (which is the most recent due to the sort). This is a common **deduplication** pattern.

---

### Q: What does this code do? (`2024DataEPCJoin.ipynb`)

```python
data['fullAddress'] = data.apply(
    lambda row: f"{row['paon']} {row['street']}".upper()
    if pd.isna(row['saon'])
    else f"{row['saon']} {row['paon']} {row['street']}".upper(),
    axis=1
)

merged_df = pd.merge(
    data, combinedEPC,
    left_on=['fullAddress', 'postcode'],
    right_on=['ADDRESS', 'POSTCODE'],
    how='inner'
)
```

**A:** Constructs a full address string for each property sale, then joins it with EPC certificate data to link sale prices to energy performance data.

- **`f"{}"`** — Python f-string for string interpolation. Variables inside `{}` are evaluated and inserted.
- **`.upper()`** — converts the string to uppercase, ensuring case-insensitive matching when joining.
- **`pd.merge(left, right, left_on, right_on, how)`** — SQL-style join of two DataFrames. `left_on`/`right_on` specify the join columns from each side. `how='inner'` means only rows with matches in **both** DataFrames are kept (like SQL `INNER JOIN`). Other options: `'left'`, `'right'`, `'outer'`.

---

### Q: What does this code do? (`FeatureSelection.ipynb`)

```python
lasso_cv = LassoCV(cv=5, random_state=42, max_iter=10000, n_jobs=-1, eps=0.001)
lasso_cv.fit(X_train_scaled, y_train)
optimal_alpha = lasso_cv.alpha_

lasso = Lasso(alpha=optimal_alpha, random_state=42, max_iter=10000)
lasso.fit(X_train_scaled, y_train)

lasso_importance = np.abs(lasso.coef_)
selected_lasso_features = lasso_features[lasso_features['Importance'] > 0]
```

**A:** Uses **Lasso regression** (L1 regularisation) for feature selection — it automatically drives unimportant feature coefficients to exactly zero.

- **`LassoCV(cv=5)`** — Lasso with built-in **5-fold cross-validation** to automatically find the best regularisation strength (`alpha`). `cv=5` splits training data into 5 folds.
- **`n_jobs=-1`** — uses all available CPU cores for parallel computation.
- **`random_state=42`** — sets the random seed for reproducibility. Any integer works; 42 is conventional.
- **`lasso.coef_`** — the learned feature coefficients. In Lasso, many of these will be exactly 0 due to L1 penalty.
- **`np.abs(lasso.coef_)`** — takes absolute values because negative coefficients are still "important" (they indicate inverse relationships).
- Features with coefficient > 0 are the selected features; zero-coefficient features are eliminated.

---

### Q: What does this code do? (`Final Model Tuning+ Evaluation.ipynb`)

```python
X_temp, X_test, y_temp, y_test = train_test_split(X, y, test_size=0.1, random_state=42, shuffle=True)
X_train, X_val, y_train, y_val = train_test_split(X_temp, y_temp, test_size=0.1111, random_state=42, shuffle=True)
```

**A:** Creates an **80/10/10 train/validation/test split** using two successive calls to `train_test_split`.

- **`train_test_split(X, y, test_size=0.1)`** — from sklearn, randomly splits features (`X`) and target (`y`) into two sets. `test_size=0.1` reserves 10% for test.
- The second split uses **`test_size=0.1111`** (i.e. 1/9) because 10% of the remaining 90% = 10% of total. So: 90% × (1/9) = 10% validation, leaving 80% for training.
- **`shuffle=True`** — randomly shuffles data before splitting, preventing ordering bias (e.g., if data is sorted by price).
- The **validation set** is used for hyperparameter tuning (avoids overfitting to test data). The **test set** is held out until final evaluation.

---

### Q: What does this code do? (`Final Model Tuning+ Evaluation.ipynb`)

```python
train_coords = X_train[['latitude', 'longitude']].to_numpy()
train_prices = y_train.to_numpy()
tree = KDTree(train_coords, metric='euclidean')

_, train_indices = tree.query(train_coords, k=k+1)
train_indices = train_indices[:, 1:]  # exclude self
train_local_avg = np.array([train_prices[i].mean() for i in train_indices])
X_train['local_avg_price'] = train_local_avg
```

**A:** Creates a **local average price** feature — the mean sale price of the `k` geographically nearest properties. This captures neighbourhood-level pricing that the model can't learn from individual house features alone.

- **`KDTree(coords, metric='euclidean')`** — sklearn's KDTree (different from scipy's `cKDTree` used elsewhere). Built only on **training data** to prevent data leakage.
- **`tree.query(coords, k=k+1)`** — returns `(distances, indices)` of k+1 nearest neighbors. The `_` discards distances (we only need indices).
- **`train_indices[:, 1:]`** — NumPy 2D array slicing. `[:, 1:]` means "all rows, columns from index 1 onwards" — this removes the first column (index 0), which is the point itself (distance = 0). Prevents a house's own price from appearing in its local average.
- **List comprehension `[train_prices[i].mean() for i in train_indices]`** — for each house, takes the prices of its k nearest neighbors and computes their mean.

---

### Q: What does this code do? (`Final Model Tuning+ Evaluation.ipynb`)

```python
def objective(trial):
    params = {
        'n_estimators': trial.suggest_int('n_estimators', 100, 500),
        'max_depth': trial.suggest_int('max_depth', 3, 12),
        'learning_rate': trial.suggest_float('learning_rate', 0.01, 0.2, log=True),
        'subsample': trial.suggest_float('subsample', 0.6, 1.0),
        'colsample_bytree': trial.suggest_float('colsample_bytree', 0.6, 1.0),
        'reg_alpha': trial.suggest_float('reg_alpha', 0, 1.0),
        'reg_lambda': trial.suggest_float('reg_lambda', 0.5, 2.0),
    }
    model = XGBRegressor(**params)
    model.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)
    preds = model.predict(X_val)
    return mean_absolute_error(y_val, preds)

study = optuna.create_study(direction='minimize')
study.optimize(objective, n_trials=50)
```

**A:** Uses **Optuna** for Bayesian hyperparameter optimisation of an XGBoost model, running 50 trials to minimise MAE.

- **`trial.suggest_int/float(name, low, high)`** — Optuna's API for defining a search space. Unlike grid search, Optuna uses **Bayesian optimisation** — it learns from previous trials to sample more promising regions.
- **`log=True`** — samples `learning_rate` on a logarithmic scale, meaning 0.01 and 0.1 are equally likely. Appropriate for parameters that vary over orders of magnitude.
- **`**params`** — dictionary unpacking. Passes all key-value pairs as named arguments to `XGBRegressor()`.
- **`direction='minimize'`** — tells Optuna to minimise the returned metric (MAE). Use `'maximize'` for metrics like R² or accuracy.
- **`n_trials=50`** — runs 50 different hyperparameter combinations, each training a full model.

---

### Q: What does this code do? (`Final Model Tuning+ Evaluation.ipynb`)

```python
explainer = shap.Explainer(final_model)
shap_values = explainer(X_test)

shap_importance = np.abs(shap_values.values).mean(axis=0)
shap_df = pd.DataFrame({
    'Feature': X_test.columns,
    'Mean SHAP Value': shap_importance
}).sort_values(by='Mean SHAP Value', ascending=False)
```

**A:** Computes **SHAP (SHapley Additive exPlanations)** values for feature importance across the test set.

- **`shap.Explainer(model)`** — creates a SHAP explainer specific to the model type. For tree-based models (XGBoost), it uses `TreeExplainer` under the hood which is optimised for speed.
- **`explainer(X_test)`** — computes SHAP values for every prediction. Each value represents how much a feature pushed the prediction up or down from the baseline (expected value).
- **`shap_values.values`** — a 2D NumPy array of shape `(n_samples, n_features)`.
- **`np.abs(...).mean(axis=0)`** — takes absolute values (positive and negative contributions both matter), then averages across all samples (`axis=0` = mean down the rows). The result is one importance score per feature.

---

### Q: What does this code do? (`Final Model Tuning+ Evaluation.ipynb`)

```python
model_artifacts = {
    'model': final_model,
    'label_encoders': label_encoders,
    'feature_columns': X_test.columns.tolist(),
    'kdtree': tree,
    'train_prices': train_prices,
    'shap_explainer': explainer,
}
joblib.dump(model_artifacts, 'house_price_model_artifacts.joblib')
```

**A:** Serialises all objects needed for inference into a single file — the trained model plus all its dependencies.

- **`joblib.dump(obj, filename)`** — serialises Python objects to disk. Preferred over `pickle` for ML artifacts because it's more efficient with large NumPy arrays.
- The dictionary bundles everything the backend's `price_predictor.py` needs: the model itself, the label encoders (to transform categorical inputs), feature column order, the KDTree (for local_avg_price), training prices, and the SHAP explainer.
- **`.tolist()`** — converts a pandas Index to a plain Python list for cleaner serialisation.
- This pattern ensures the backend doesn't need access to the training data or notebooks — just this one `.joblib` file.

---

### Q: What does this code do? (`Final Model Tuning+ Evaluation.ipynb`)

```python
bins = [0, 100_000, 200_000, 300_000, 400_000, 500_000,
        600_000, 700_000, 800_000, 900_000, 1_000_000,
        2_000_000, 3_000_000, 4_000_000, 5_000_000]
labels = ['£0–100k', '£100k–200k', '£200k–300k', ...]

price_band = pd.cut(y_test, bins=bins, labels=labels)

band_results = df_eval.groupby('PriceBand').apply(band_stats).round(2)
```

**A:** Evaluates model accuracy broken down by **price band** to see where the model performs well vs. poorly.

- **`pd.cut(series, bins, labels)`** — bins continuous values into discrete categories. Each value is assigned to the bin whose edges it falls between. Like creating histogram buckets.
- **`100_000`** — Python's numeric literal underscore separator. Purely visual — `100_000 == 100000`. Makes large numbers readable.
- **`.groupby('PriceBand').apply(band_stats)`** — groups rows by their price band, then applies a custom function to each group. Returns a DataFrame with one row per band.
- This reveals if the model is, e.g., accurate for £200k–£400k houses but struggles with £1M+ properties (common in house price models due to fewer training samples at extremes).

---

### Q: What does this code do? (`price_predictor.py`)

```python
def initialise():
    global model, label_encoders, feature_columns, kdtree, train_prices, shap_explainer
    model_artifacts = load('house_price_model_artifacts.joblib')
    model = model_artifacts['model']
    label_encoders = model_artifacts['label_encoders']
    feature_columns = model_artifacts['feature_columns']
    kdtree = model_artifacts['kdtree']
    train_prices = model_artifacts['train_prices']
    shap_explainer = model_artifacts['shap_explainer']
```

**A:** Loads all pre-trained ML artifacts from disk into **global variables** on first use (lazy initialisation).

- **`global`** — declares that these variables belong to the module scope, not the function scope. This means they persist in memory across requests without reloading.
- **`load()` (joblib)** — deserialises the `.joblib` file back into Python objects.
- This is a form of **in-process caching** — the model, KDTree, and SHAP explainer are loaded once and reused for every prediction. Without this, each request would re-read ~100MB+ of artifacts from disk.
- **Tradeoff:** process-local globals can't be shared across multiple server instances (a bottleneck for horizontal scaling).

---

### Q: What does this code do? (`price_predictor.py`)

```python
coords = np.array([[data['latitude'], data['longitude']]])
distances, indices = kdtree.query(coords, k=50)
local_avg = np.array([train_prices[idx].mean() for idx in indices])

shap_values = shap_explainer(input_df)
feature_importance = {
    feature: float(shap_values.values[0][i])
    for i, feature in enumerate(feature_columns)
}
```

**A:** Calculates the local average price from 50 nearest training properties, then generates per-feature SHAP explanations for a single prediction.

- **`kdtree.query(coords, k=50)`** — finds the 50 nearest training-set properties to the target location.
- **`train_prices[idx].mean()`** — averages the known sale prices of those 50 neighbors to create a hyper-local price benchmark.
- **`shap_explainer(input_df)`** — generates SHAP values for this specific prediction. Each value represents a feature's contribution in pounds (e.g., floor area added +£45,000 to the prediction).
- **`shap_values.values[0][i]`** — `[0]` gets the first (and only) sample, `[i]` gets the i-th feature's SHAP value.
- **Dictionary comprehension with `enumerate()`** — `enumerate` yields `(index, value)` pairs, used to build a `{feature_name: shap_value}` mapping.

---

### Q: What does this code do? (`feasibility_model.py`)

```python
def calculate_monthly_payment(principal, annual_rate, term_years):
    monthly_rate = annual_rate / 12 / 100
    n = term_years * 12
    if monthly_rate == 0:
        return principal / n
    return principal * (monthly_rate * (1 + monthly_rate)**n) / ((1 + monthly_rate)**n - 1)
```

**A:** Calculates the monthly mortgage repayment using the **standard amortisation formula**.

- **Formula:** `M = P × [r(1+r)^n] / [(1+r)^n - 1]` where `P` = principal, `r` = monthly interest rate, `n` = total number of payments.
- **`annual_rate / 12 / 100`** — converts annual percentage rate (e.g., 5.5%) to a monthly decimal rate (e.g., 0.004583).
- **`(1 + monthly_rate)**n`** — Python's exponentiation operator `**`. Computes compound interest factor over `n` months.
- The `if monthly_rate == 0` guard handles the edge case of a 0% interest rate, which would cause division by zero in the main formula.

---

### Q: What does this code do? (`feasibility_model.py`)

```python
def calculate_post_tax_income(annual_salary):
    personal_allowance = 12570
    if annual_salary > 100000:
        personal_allowance = max(0, 12570 - (annual_salary - 100000) / 2)

    basic_limit = 50270
    higher_limit = 125140

    tax = 0
    if annual_salary > personal_allowance:
        taxable = annual_salary - personal_allowance
        basic = min(taxable, basic_limit - personal_allowance)
        tax += basic * 0.20
        if taxable > basic_limit - personal_allowance:
            higher = min(taxable - basic, higher_limit - basic_limit)
            tax += higher * 0.40
            if taxable > higher_limit - personal_allowance:
                additional = taxable - (higher_limit - personal_allowance)
                tax += additional * 0.45
    # ... NI calculation
    return annual_salary - tax - ni
```

**A:** Calculates UK take-home pay after income tax and National Insurance using 2025/26 tax bands.

- **Personal allowance tapering** — above £100k, the £12,570 tax-free allowance reduces by £1 for every £2 earned (the `/ 2`). `max(0, ...)` ensures it doesn't go negative.
- **Progressive tax bands** — each band only applies to income within that range:
  - 20% on £12,571–£50,270 (basic rate)
  - 40% on £50,271–£125,140 (higher rate)
  - 45% on £125,140+ (additional rate)
- **`min(taxable, limit)`** — caps each band so you only tax the portion that falls within it, not the entire salary.

---

### Q: What does this code do? (`recommendation_service.py`)

```python
WEIGHTS = {
    'balanced': np.array([1.0, 1.0, 1.0, 1.0]),
    'location': np.array([2.0, 2.0, 0.5, 0.5]),
    'price':    np.array([0.5, 0.5, 2.0, 1.0])
}

# During model fitting:
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
X_weighted = X_scaled * WEIGHTS[priority]
model = NearestNeighbors(n_neighbors=k, metric='euclidean')
model.fit(X_weighted)
```

**A:** Builds a weighted nearest-neighbors recommendation model where the user's **priority** changes which features matter most.

- **`StandardScaler().fit_transform(X)`** — standardises features to mean=0, std=1. Without this, features with larger scales (e.g., price in £100,000s) would dominate distance calculations over smaller-scale features (e.g., latitude ~51.5).
- **`X_scaled * WEIGHTS[priority]`** — element-wise multiplication. Doubling a feature's weight (2.0) makes distances in that dimension count twice as much in the Euclidean distance calculation.
- **`NearestNeighbors(metric='euclidean')`** — sklearn's unsupervised nearest-neighbors model. Unlike KDTree, this is a higher-level API that handles the query interface.
- The three priorities give users control: `'location'` emphasises lat/lon (nearby houses), `'price'` emphasises predicted price and floor area (similarly-valued houses).

---

### Q: What does this code do? (`enhanced_search.py`)

```python
if criteria.get('onlyAffordable'):
    affordable_houses = []
    for house in house_list:
        system_inputs = {'house_price': house['predicted_price'], ...}
        user_inputs = {'annual_income': criteria['annual_income'], ...}
        result = get_feasibility(system_inputs, user_inputs)
        if result.get('is_affordable'):
            affordable_houses.append(house)
    house_list = affordable_houses
```

**A:** Filters search results to only show properties the user can afford by running a full feasibility check on **every** matching house.

- **`criteria.get('onlyAffordable')`** — `.get()` safely retrieves a dictionary key, returning `None` (falsy) if the key doesn't exist, avoiding a `KeyError`.
- **O(N) complexity** — this loops through all matching houses and calls `get_feasibility()` for each one. If there are 5,000 matches, that's 5,000 full affordability calculations — a major bottleneck.
- This is called **before pagination**, meaning even if the user only sees 10 results per page, the server still evaluates every single match.
- A better approach: precompute affordability flags or paginate first, then filter only the current page.

---

### Q: What does this code do? (`upload_mock_data.py`)

```python
batch_size = 500
records = []
for _, row in df.iterrows():
    house = House(
        price=int(row['true_price']),
        postcode=row['postcode'],
        # ... 100+ field mappings
    )
    records.append(house)
    if len(records) >= batch_size:
        db.session.bulk_save_objects(records)
        db.session.commit()
        records = []

if records:
    db.session.bulk_save_objects(records)
    db.session.commit()
```

**A:** Bulk-inserts house data from a CSV into the SQLite database in batches of 500 using SQLAlchemy.

- **`df.iterrows()`** — iterates over DataFrame rows as `(index, Series)` pairs. The `_` discards the index.
- **`db.session.bulk_save_objects(records)`** — SQLAlchemy's bulk insert method. Much faster than `db.session.add()` one-by-one because it batches the SQL `INSERT` statements.
- **`db.session.commit()`** — commits the current transaction to the database. Without this, inserts are rolled back when the session ends.
- **Batch pattern** — inserting 500 at a time balances memory usage (not loading all records at once) with performance (fewer commits than one-at-a-time).
- The final `if records:` handles the remainder — if the CSV has 1,200 rows, the last 200 are committed in the final batch.

---

### Q: What does this code do? (`HouseSearch.js` — Frontend)

```javascript
const fetchEnrichedData = async () => {
  const houseNumber = selectedAddress.split(",")[0];

  const enrichResponse = await axios.post(`${config.API_URL}/fetch-and-enrich`, {
    postcode,
    house_number_or_name: houseNumber,
  });

  if (enrichResponse.status === 200) {
    const enrichedData = enrichResponse.data.enriched_data;

    const predictResponse = await fetch(`${config.API_URL}/predict-price`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enriched_data: enrichedData }),
    });

    const result = await predictResponse.json();
    enrichedData.predicted_price = result.predicted_price;
    navigate("/details", { state: { enrichedData } });
  }
};
```

**A:** Implements a **two-stage API call** — first fetches and enriches property data, then passes it to the price prediction endpoint.

- **`async/await`** — modern JavaScript syntax for handling Promises. `await` pauses execution until the Promise resolves, making async code read like synchronous code.
- **`axios.post(url, data)`** — sends an HTTP POST request. Axios automatically serialises the data object to JSON and sets headers. The response is already parsed.
- **`fetch(url, options)`** — the browser's built-in HTTP API. Unlike Axios, you must manually set `Content-Type`, call `JSON.stringify()`, and call `.json()` on the response.
- **`navigate("/details", { state: { enrichedData } })`** — React Router's programmatic navigation. `state` passes data to the target page without putting it in the URL (similar to passing props but across routes). The target page accesses it via `useLocation().state`.

---

### Q: What does this code do? (`HouseDetails.js` — Frontend)

```javascript
const saveRecentSearch = () => {
  let recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
  recentSearches = recentSearches.filter(
    (recentHouse) => recentHouse.postcode !== house.postcode
  );
  recentSearches.unshift(house);

  if (recentSearches.length > 5) {
    recentSearches.pop();
  }

  localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
};
```

**A:** Saves the current property to a **FIFO (First-In, First-Out) queue** of recent searches in the browser's localStorage, capped at 5 items.

- **`localStorage.getItem(key)`** — retrieves a string from the browser's persistent key-value store. Returns `null` if the key doesn't exist.
- **`JSON.parse(...) || []`** — parses the JSON string back into an array. The `|| []` provides a default empty array if `null` is returned (since `JSON.parse(null)` returns `null`).
- **`.filter()`** — removes any existing entry with the same postcode to prevent duplicates.
- **`.unshift(house)`** — adds the new search to the **front** of the array (most recent first). Contrast with `.push()` which adds to the end.
- **`.pop()`** — removes the **last** element (oldest search) if the array exceeds 5 items.
- **`JSON.stringify()`** — converts the array back to a JSON string for storage (localStorage only stores strings).

---

### Q: What does this code do? (`EnhancedSearchFields.js` — Frontend)

```javascript
const convertWalkingTimeToDistance = (minutes) => {
  if (!minutes) { return null; }
  const avgWalkingSpeedKmPerMin = 0.08;  // ~4.8 km/h
  return (minutes * avgWalkingSpeedKmPerMin).toFixed(2);
};

const handleChange = (e) => {
  const { name, value, type, checked } = e.target;
  setSearchCriteria((prev) => ({
    ...prev,
    [name]: type === "checkbox" ? checked : value,
  }));
};
```

**A:** Two utility functions: one converts walking minutes to kilometers, the other handles form input changes for the search filter.

- **`.toFixed(2)`** — formats a number to exactly 2 decimal places, returning a string. `0.24000` → `"0.24"`.
- **`const { name, value, type, checked } = e.target`** — **destructuring assignment**. Extracts multiple properties from `e.target` (the DOM element that fired the event) in one line.
- **`...prev`** — the **spread operator**. Copies all existing key-value pairs from the previous state into a new object. This is how you do immutable state updates in React.
- **`[name]:`** — **computed property name**. The variable `name` (e.g., `"postcode"`) becomes the key. Without brackets, the literal string `"name"` would be used.
- **Ternary `type === "checkbox" ? checked : value`** — checkboxes use `checked` (boolean), all other inputs use `value` (string).

---

### Q: What does this code do? (`MonthlyOutgoingsChart.js` — Frontend)

```javascript
ChartJS.register(ArcElement, Tooltip, Legend);

const costData = [
  feasibilityData?.monthly_payment || 0,
  houseData?.heating_cost_current / 12 || 0,
  // ...
];

const totalMonthlyOutgoings = costData
  .reduce((sum, value) => sum + Number(value), 0)
  .toFixed(2);

const tooltipOptions = {
  callbacks: {
    label: function(context) {
      const value = context.parsed;
      const total = context.dataset.data.reduce((a, b) => Number(a) + Number(b), 0);
      const percentage = ((value * 100) / total).toFixed(1);
      return `£${value} (${percentage}%)`;
    }
  }
};
```

**A:** Configures a Chart.js doughnut chart for monthly housing costs with custom tooltips showing both pounds and percentages.

- **`ChartJS.register(...)`** — Chart.js v4 uses a tree-shakable architecture. You must explicitly register only the components you use (arc elements for doughnuts, tooltip plugin, etc.).
- **`feasibilityData?.monthly_payment`** — **optional chaining** (`?.`). If `feasibilityData` is `null`/`undefined`, returns `undefined` instead of throwing a TypeError. The `|| 0` provides a fallback.
- **`.reduce((sum, value) => sum + Number(value), 0)`** — reduces an array to a single value by accumulating. `0` is the initial value of `sum`. `Number(value)` ensures string-to-number conversion.
- **`callbacks.label`** — Chart.js tooltip callback. The `context` object contains the data point being hovered. `context.parsed` is the numeric value, `context.dataset.data` is the full dataset. This customises tooltip text from the default to `"£150.00 (32.5%)"`.

---

### Q: What does this code do? (`App.js` — Frontend)

```javascript
useEffect(() => {
  const handleTabClose = (event) => {
    localStorage.clear();
  };

  window.addEventListener("beforeunload", handleTabClose);

  return () => {
    window.removeEventListener("beforeunload", handleTabClose);
  };
}, []);
```

**A:** Clears all localStorage data when the user closes or refreshes the browser tab, and properly cleans up the event listener.

- **`useEffect(() => {...}, [])`** — React hook that runs side effects. The empty dependency array `[]` means it runs **once on mount** (like `componentDidMount`). Without `[]`, it would run on every render.
- **`window.addEventListener("beforeunload", ...)`** — the `beforeunload` event fires just before the page is unloaded (tab close, refresh, navigation away).
- **`localStorage.clear()`** — removes all key-value pairs from localStorage. This means financial data and recent searches are session-only.
- **`return () => { ... }`** — the **cleanup function**. React calls this when the component unmounts, removing the event listener to prevent memory leaks. This is the React equivalent of `componentWillUnmount`.
