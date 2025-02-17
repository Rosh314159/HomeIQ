from models import House, db
from flask import request, jsonify

def search_houses(search_params):
    try:
        query = House.query

        # Extract and validate query parameters
        price_min = search_params.get("priceMin")
        price_max = search_params.get("priceMax")
        postcode = search_params.get("postcode", "").strip()
        property_type = search_params.get("propertyType", "").strip()
        town_city = search_params.get("townCity", "").strip()

        # Convert price fields safely
        try:
            price_min = int(price_min) if price_min and price_min.isdigit() else None
            price_max = int(price_max) if price_max and price_max.isdigit() else None
        except ValueError:
            return jsonify({"error": "Invalid price format"}), 400

        # Apply filters only if they have valid values
        if price_min is not None:
            query = query.filter(House.ask_price >= price_min)
        if price_max is not None:
            query = query.filter(House.ask_price <= price_max)
        if postcode:
            query = query.filter(House.postcode.ilike(f"%{postcode}%"))
        if property_type:
            query = query.filter(House.property_type == property_type)
        if town_city:
            query = query.filter(House.town_city.ilike(f"%{town_city}%"))

        # Pagination parameters
        try:
            page = int(search_params.get("page", 1))
            limit = int(search_params.get("limit", 50))
        except ValueError:
            return jsonify({"error": "Invalid pagination parameters"}), 400
        
        if page < 1 or limit < 1:
            return jsonify({"error": "Page and limit must be greater than 0"}), 400

        offset = (page - 1) * limit

        # Get total count before applying limit and offset
        total_count = query.count()

        # Apply pagination
        houses = query.offset(offset).limit(limit).all()

        # Convert query results to a list of dictionaries
        house_list = [
            {
                "price": house.price,
                "ask_price": house.ask_price,
                "predicted_price": house.predicted_price,
                "postcode": house.postcode,
                "property_type": house.property_type,
                "paon": house.paon,
                "street": house.street,
                "town_city": house.town_city,
                "latitude": house.latitude,
                "longitude": house.longitude,
                "nearest_shop_name": house.nearest_shop_name,
            }
            for house in houses
        ]

        return jsonify({
            "houses": house_list,
            "total_count": total_count,
            "page": page,
            "limit": limit,
            "total_pages": (total_count // limit) + (1 if total_count % limit > 0 else 0)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

