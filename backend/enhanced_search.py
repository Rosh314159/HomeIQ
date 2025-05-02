from models import House, db
from flask import request, jsonify
from feasibility_model import get_feasibility
def search_houses(search_params):
    try:
        query = House.query

        # Extract and validate query parameters
        price_min = search_params.get("priceMin", 0)
        price_max = search_params.get("priceMax", 100000000)
        postcode = search_params.get("postcode", "").strip()
        property_type = search_params.get("propertyType", "").strip()
        town_city = search_params.get("townCity", "").strip()
        only_affordable = search_params.get("onlyAffordable", False)
        undervalued = search_params.get("undervalued", "")
        nearest_primary_school_distance = search_params.get("nearestPrimarySchoolDistance", -1)
        nearest_secondary_school_distance = search_params.get("nearestSecondarySchoolDistance", -1)
        nearest_train_station_distance = search_params.get("nearestTrainStationDistance", -1)


       # Map property types from frontend format to database format
        property_type_mapping = {
            "Detached": "D",
            "Semi-Detached": "S",
            "Terraced": "T",
            "Flat": "F",
            "Bungalow": "B"
        }
        # Handle property type as a single string value
        mapped_property_type = None
        if property_type != "" and property_type in property_type_mapping:
            mapped_property_type = property_type_mapping[property_type]
        # Convert price fields safely
        try:
            price_min = int(price_min) if price_min else None
            price_max = int(price_max) if price_max else None
            nearest_primary_school_distance = float(nearest_primary_school_distance) if nearest_primary_school_distance else None
            nearest_secondary_school_distance = float(nearest_secondary_school_distance) if nearest_secondary_school_distance else None
            nearest_train_station_distance = float(nearest_train_station_distance) if nearest_train_station_distance else None
        except ValueError:
            return jsonify({"error": "Invalid price format"}), 400

        # Apply filters only if they have valid values
        if price_min is not None:
            query = query.filter(House.predicted_price >= price_min)
        if price_max is not None:
            query = query.filter(House.predicted_price <= price_max)
        if postcode != "":
            query = query.filter(House.postcode.ilike(f"%{postcode}%"))
        if mapped_property_type:
             query = query.filter(House.property_type == mapped_property_type)
        if town_city != "":
            query = query.filter(House.town_city.ilike(f"%{town_city}%"))
        if undervalued == "undervalued":
            query = query.filter(House.predicted_price < House.ask_price)
        if undervalued == "overvalued":
            query = query.filter(House.predicted_price > House.ask_price)
        if nearest_primary_school_distance > 0:
            query = query.filter(House.nearest_primary_school_distance <= nearest_primary_school_distance)
        if nearest_secondary_school_distance > 0:
            query = query.filter(House.nearest_secondary_school_distance <= nearest_secondary_school_distance)
        if nearest_train_station_distance > 0:
            query = query.filter(House.nearest_train_station_distance <= nearest_train_station_distance)

        if only_affordable == 'true':
            affordable_house_ids = []
            houses = query.all()  # Get all matching houses before filtering

            for house in houses:
                system_inputs = {
                    "house_price": house.predicted_price,
                    "loan_term_years": 30,  # Default loan term
                    "interest_rate": 3.5,  # Default interest rate
                    "property_tax": 200,  # Estimated tax
                    "insurance": 100,  # Estimated insurance
                    "utility_bills": 150,  # Estimated bills
                }
                user_inputs = {
                    "annual_income" : int(search_params.get("annual_income")),
                    "debt_obligations" : int(search_params.get("debt_obligations")),
                    "savings" : int(search_params.get("deposit_amount")),
                    "is_first_home": bool(search_params.get("is_first_home")),
                }
                feasibility = get_feasibility(system_inputs, user_inputs)
                if feasibility["is_affordable"]:
                    affordable_house_ids.append(house.id)
            query = query.filter(House.id.in_(affordable_house_ids))

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

        # Dynamically retrieve all column names from the model
        column_names = [col for col in House.__table__.columns.keys()]

        # Convert query results to a list of dictionaries dynamically
        house_list = [ {col.lower(): getattr(house, col) for col in column_names} for house in houses ]

        # Calculate and add percentage difference between asking price and predicted price
        for house in house_list:
            if 'predicted_price' in house and 'ask_price' in house and house['ask_price'] > 0:
                house['price_difference_percent'] = abs((house['ask_price'] - house['predicted_price']) / house['ask_price'] * 100)
            else:
                house['price_difference_percent'] = float('inf')  # Handle missing data or zero asking price

        # Sort the list by percentage difference (smaller values first)
        house_list.sort(key=lambda x: x.get('price_difference_percent', float('inf')))

        return jsonify({
            "houses": house_list,
            "total_count": total_count,
            "page": page,
            "limit": limit,
            "total_pages": (total_count // limit) + (1 if total_count % limit > 0 else 0)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

