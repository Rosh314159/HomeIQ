# HomeIQ Presentation Script

Speaker notes for each slide. Target total duration: ~15 minutes.

---

## Slide 1: Title
**[~15 seconds]**

"Hi, I'm Roshan. Today I'm going to walk you through HomeIQ, a project I built that uses machine learning to help UK homebuyers understand whether a property is fairly priced and whether they can actually afford it. I'll cover the ML research first, then the web platform I built to serve the model."

---

## Slide 2: The Problem
**[~45 seconds]**

"So the problem. If you've ever tried to buy a house in the UK, you know the experience is fragmented. Energy data, school ratings, transport links, and prices all sit on different websites. There's no way to tell if an asking price is actually fair. And affordability checks mean pulling out a spreadsheet and hoping for the best.

The thing is, all of this data already exists publicly. Nobody has joined it together into something useful."

---

## Slide 3: Existing Solutions
**[~45 seconds]**

"There are existing platforms, of course. Rightmove and Zoopla between them have over 100 million monthly users. They list properties for sale, some offer price prediction algorithms, and they link out to third-party mortgage calculators. You can look up most houses on the market.

But there are real gaps. None of them integrate with your actual financial data. There are no personalised house recommendations. The mortgage calculators are external tools with their own privacy concerns. And the property details are often limited, especially around things like energy performance, nearby schools, or transport access."

---

## Slide 4: Proposed Solution
**[~45 seconds]**

"So what I built is HomeIQ. It's a web application that predicts house prices using diverse public datasets and evaluates affordability using the user's own financial data. It also gives personalised house recommendations and helps users make data-driven decisions rather than relying on guesswork.

The key objectives were: build an ML model that can predict the value of any UK house, build a financial feasibility model using real lending criteria, provide house recommendations tailored to the user, and wrap it all in a UI that's easy to navigate."

---

## Slide 5: Section Header - ML Development
**[~5 seconds]**

"Let's start with the ML side."

---

## Slide 6: ML Pipeline Overview
**[~45 seconds]**

"The ML work broke down into four stages, each in its own Jupyter notebook.

First, data fusion: I joined 2024 Land Registry sale prices with EPC certificates from 2022 to 2024. Second, feature engineering: I used KDTree spatial indexing to enrich every property with distances to nearest schools, shops, and transport stops, along with the school's Ofsted rating. Third, feature selection: starting from 66+ columns, I used Lasso regularisation and correlation analysis to narrow it down to 16 features. And fourth, model training: XGBoost with Bayesian hyperparameter tuning via Optuna, plus SHAP for per-prediction explainability.

Let me walk through each stage."

---

## Slide 7: Data Fusion
**[~1 minute]**

"Starting with data fusion. I had two datasets: house prices from the Land Registry, which has no column headers in the CSV so I defined them manually, and EPC certificates from the government's open data API.

The key decision was using three years of EPC data, not just one. EPCs are valid for ten years, so a house sold in 2024 might have a certificate from 2022 or 2023. Using only 2024 certificates would miss roughly 60% of possible matches.

I combined the three years with pd.concat, then sorted by inspection date and dropped duplicates on UPRN, which is a unique property reference number. That gives me the most recent certificate per property.

For joining, I built a composite key. The house price data has a PAON field, which is the house number, and a street field. I combined those into a full address string, uppercased everything for consistency, and did an inner join on address plus postcode with the EPC data. Inner join because I wanted quality over quantity: only records with both a confirmed sale price and energy data."

---

## Slide 8: Geospatial Feature Engineering
**[~1 minute]**

"Next, I enriched every property with information about its surroundings. The idea is that a house's value depends heavily on what's nearby: the quality of local schools, how close the nearest train station is, whether there's a supermarket within walking distance.

I loaded three auxiliary datasets: around 30,000 schools with Ofsted ratings, retail locations, and public transport stops. For each dataset, I built a cKDTree from scipy. That's a spatial index that lets you find the nearest point in O(log n) time instead of brute-forcing through every record.

The distance calculation uses a two-phase approach. Phase 1 is the KDTree query, which uses Euclidean distance on raw lat/lon. That's fast but not geographically accurate because a degree of latitude and longitude represent different physical distances. Phase 2 takes the nearest point identified by the KDTree and computes the true great-circle distance using geopy's geodesic function. So I get the speed of KDTree for the search and the accuracy of geodesic for the final distance.

One complication: the transport data was in British National Grid coordinates (Easting/Northing), not lat/lon. I had to convert those to WGS84 using pyproj before building the KDTree.

This stage produced 12 new features, including school distances, Ofsted ratings, binary flags for whether the nearest school is outstanding, shop and transport distances, and property age derived from the EPC construction age band using regex."

---

## Slide 9: Feature Selection
**[~45 seconds]**

"At this point I had 66+ columns. Many of those would add noise or cause problems if left in.

I used three methods to narrow things down. First, domain knowledge: I removed identifiers, text descriptions, dates, and anything with 'POTENTIAL' in the name. Those POTENTIAL columns represent what the house could be rated after improvements, so using them to predict current price would be data leakage.

Second, correlation analysis. I looked at correlation with price and with floor area. If a feature is highly correlated with floor area, it's probably not adding new information beyond what floor area already captures.

Third, Lasso regression with L1 regularisation. The L1 penalty drives unimportant feature coefficients to exactly zero, which is a more principled way to select features than picking arbitrary thresholds. I used LassoCV to find the optimal regularisation strength through 5-fold cross-validation.

The result was 16 features, plus one engineered feature I'll explain on the next slide."

---

## Slide 10: Model Training & local_avg_price
**[~1.5 minutes]**

"This is where the interesting engineering decisions happen.

I used an 80/10/10 train/validation/test split. The validation set is for hyperparameter tuning, and the test set is held out until the very end.

The single most impactful thing I did was engineering a feature called local_avg_price. The idea is simple: a house's value is heavily influenced by what nearby houses have sold for. Estate agents call these 'comparables.' I built a KDTree on the training set coordinates, then for each property, I queried the 50 nearest training properties and averaged their sale prices.

The critical detail is preventing data leakage. The KDTree is built from training data only. When computing local_avg_price for training samples, I query k+1 neighbors and drop the first column, which is the point itself. For validation and test samples, I query k neighbors from the training tree. Test set prices never leak into any feature.

I tested k values from 1 to 100 on the validation set. k=50 gave the best balance: specific enough to capture local pricing but stable enough to smooth out outliers.

For hyperparameter tuning, I used Optuna's Bayesian optimisation rather than grid or random search. Optuna uses a Tree-structured Parzen Estimator to learn from previous trials and focus on promising regions of the search space. 50 trials across 7 parameters.

After finding the best hyperparameters, I retrained on train plus validation combined, giving the model 90% of the data. The test set was only used for the final evaluation you'll see on the next slide."

---

## Slide 11: Model Results
**[~1 minute]**

"Here are the results. The table shows accuracy at different tolerance levels, comparing before and after adding local_avg_price.

Before that feature, only 16.5% of predictions were within 5% of the actual sale price. After adding it: 45.3%. Within 10% went from 30.8% to 77.6%. That one feature nearly tripled the model's accuracy at tight tolerances.

**[Point to placeholder]** I have a tolerance curve chart showing this visually that I'll insert here.

On the explainability side, SHAP gives per-prediction explanations in actual pound values. So for a specific property, the model might say: 'I predicted £320k. Floor area contributed +£45k, the local average price added +£30k, but distance to the nearest train station pulled it down by £12k.' Every feature gets a signed contribution. That's much more useful than a global ranking, because users want to know why their specific house was valued the way it was.

I chose SHAP over XGBoost's built-in feature_importances_ for exactly this reason. Built-in importances tell you which features matter overall, but SHAP tells you how each feature affected this particular prediction."

---

## Slide 12: Model Artefact Packaging
**[~30 seconds]**

"The last step in the ML pipeline is packaging everything for production. I bundled six objects into a single joblib file: the trained XGBoost model, the label encoders for categorical features, the expected feature column order, the KDTree plus training prices for computing local_avg_price at inference time, and the SHAP explainer.

The backend loads this one file on startup and caches everything in memory. It never needs access to the training notebooks or the original CSVs. One file gives you complete inference capability.

The tradeoff is that these are process-local globals, so if you wanted to run multiple server instances, each one would need its own copy in memory. That's a scaling limitation I'll touch on later."

---

## Slide 13: Section Header - Web Platform
**[~5 seconds]**

"Let's move to the web platform."

---

## Slide 14: System Architecture
**[~45 seconds]**

"The architecture is straightforward. A React 19 single-page application talks to a Flask backend over REST. The backend sits in front of a SQLite database.

There are five main endpoints. /fetch-and-enrich calls the government EPC API, then runs the spatial enrichment pipeline. /predict-price takes that enriched data and runs the ML model. /feasibility does the affordability assessment. /recommendations finds similar properties. And /enhanced_search handles filtered, paginated queries.

The data layer includes the SQLite database with five tables: houses (110 columns), schools, shops, transport stops, and postcode locations for coordinate lookups. The ML model artefact and five KDTree indexes sit in memory."

---

## Slide 15: Backend Services
**[~1.5 minutes]**

"Let me go deeper on the three most interesting backend services.

The price predictor lazy-loads the joblib artefact on first request, then caches everything. For each prediction, it queries the KDTree for 50 nearest training properties to compute local_avg_price, label-encodes the categorical features (handling unseen categories by mapping them to 'Unknown'), runs model.predict(), then runs the SHAP explainer. It returns the predicted price, the expected value (baseline), the actual feature values, and a dictionary of SHAP contributions per feature.

The feasibility model implements real UK mortgage lending criteria. It calculates income tax using the 2025/26 bands, including personal allowance tapering above £100k. It computes stamp duty with first-time buyer relief. It uses the standard amortisation formula for monthly payments, and the interest rate varies by LTV tier using data I sourced from Rightmove. Four checks must all pass for a property to be considered affordable: debt-to-income under 36%, mortgage-to-income under 4.5x, LTV under 95%, and total housing bills under 50% of post-tax income.

The recommendation engine uses k-nearest-neighbors on four features: latitude, longitude, predicted price, and floor area. Features are normalised with StandardScaler, then multiplied by weight vectors that change depending on whether the user prioritises location or price. There's also an affordableOnly mode that builds a separate model filtered to just the houses the user can afford."

---

## Slide 16: Enhanced Search & Filtering
**[~45 seconds]**

"The enhanced search endpoint supports 8+ filters: price range, postcode prefix, property type, town, undervalued/overvalued detection (comparing predicted vs asking price), and walking distance to schools and stations.

On the frontend, users enter walking time in minutes. The frontend converts that to kilometres using average walking speed before sending it to the backend.

One thing worth calling out: the affordability filter has O(N) complexity. When enabled, it fetches all matching houses and runs get_feasibility() on each one before pagination. So if 5,000 houses match the other filters, that's 5,000 feasibility calculations. For an MVP it works, but it's a clear bottleneck. A better approach would be to precompute affordability flags or paginate first and only check the current page."

---

## Slide 17: Frontend Highlights
**[~1 minute]**

"On the frontend, a few things worth highlighting.

The property search is a multi-stage flow. The user enters a postcode, which hits the Ideal Postcodes API for address autocomplete. They select an address, which triggers the backend to fetch the EPC certificate, enrich it with spatial data, and run the ML prediction. All that data is then passed to the details page using React Router's state mechanism.

The SHAP explainer component maps raw ML feature names like 'total_floor_area' to human-readable labels like 'Floor Area.' It uses useMemo to sort features by absolute SHAP value, and displays them as cards with green chips for positive impacts and red chips for negative.

The financial dashboard uses Chart.js. There's a doughnut chart breaking down monthly outgoings (mortgage, heating, water, lighting, debt), and a horizontal bar chart comparing the user's financial ratios against lending thresholds. Bars turn red when a threshold is exceeded.

For state management, I didn't use Redux. Only two things need to persist across pages: the user's financial profile and their recent searches. Both are small JSON objects, so localStorage does the job. Recent searches are stored as a FIFO queue capped at 5 items."

---

## Slide 18: Key Technical Decisions
**[~45 seconds]**

"A few decisions I want to call out.

I went with a monolith rather than microservices. At this scale, the added complexity of service-to-service communication, separate deployments, and distributed debugging doesn't buy you anything. Everything shares the same process and memory space, which actually makes the KDTree caching simpler.

SQLite was deliberate for an MVP. The app is read-heavy with only one write endpoint, and SQLAlchemy abstracts the database layer, so migrating to PostgreSQL is straightforward when needed.

SHAP over built-in feature importances because users need per-prediction explanations, not just a global ranking.

And localStorage over Redux because the problem is small. Two JSON objects that need to survive page navigation. Redux would be overhead for something that fits in ten lines of code."

---

## Slide 19: Testing
**[~1 minute]**

"So how did I verify all of this actually works? I wrote unit tests for the core modules: the prediction logic, enrichment pipeline, and feasibility calculations. For the mortgage maths I validated outputs against manual spreadsheet calculations to make sure the amortisation and tax band logic was correct.

For integration testing I tested the Flask endpoints end-to-end, checking that search, predict, and feasibility flows return the right response schemas and handle bad inputs gracefully.

I also used Postman heavily for API testing. I set up collections with parameterised requests covering different property types and locations, and verified status codes and response payloads across all five endpoints.

Then I ran load tests with concurrent requests to see how the backend holds up. This is where I found an important limitation: the EPC API is rate-limited, and under concurrent load those external calls start timing out. That bottleneck informed the decision to cache EPC responses and build in retry logic."

---

## Slide 20: Deployment (Placeholder)
**[~15 seconds]**

"On deployment: the intended setup is Heroku for the backend and Vercel for the frontend. I'm still working through some issues getting this fully deployed, so I'll skip the details here and happy to discuss offline."

---

## Slide 21: Reflections & Improvements
**[~1 minute]**

"If I were building this again or taking it further, a few things I'd change.

On the ML side: the train/val/test split is random, but property prices have seasonal trends. A temporal split, training on earlier months and testing on later ones, would be more realistic. The enrichment pipeline uses pandas apply row-by-row, which is slow. Vectorising the KDTree queries to process all coordinates at once would give roughly a 100x speedup. And there's no model monitoring in production. Prediction drift detection and automated retraining triggers would be important additions.

On the web side: SQLite to PostgreSQL, ideally with PostGIS for native spatial queries. A Redis caching layer would help a lot since EPC data rarely changes, predictions are deterministic, and search results can tolerate short staleness. And testing coverage needs work, especially around mocked tests for the external EPC API dependency."

---

## Slide 22: Thank You
**[~10 seconds]**

"That's HomeIQ. I'm happy to open up VS Code and walk through any of these files in detail. Thanks for listening."

---

## Total estimated time: ~17-18 minutes
