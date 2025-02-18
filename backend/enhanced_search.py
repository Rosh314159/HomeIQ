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
        # Convert price fields safely
        try:
            price_min = int(price_min) if price_min else None
            price_max = int(price_max) if price_max else None
        except ValueError:
            return jsonify({"error": "Invalid price format"}), 400

        # Apply filters only if they have valid values
        if price_min is not None:
            query = query.filter(House.ask_price >= price_min)
        if price_max is not None:
            query = query.filter(House.ask_price <= price_max)
        if postcode != "":
            query = query.filter(House.postcode.ilike(f"%{postcode}%"))
        if property_type != "":
            query = query.filter(House.property_type == property_type)
        if town_city != "":
            query = query.filter(House.town_city.ilike(f"%{town_city}%"))
        if undervalued == "undervalued":
            query = query.filter(House.predicted_price > House.ask_price)
        if undervalued == "overvalued":
            query = query.filter(House.predicted_price < House.ask_price)

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

        return jsonify({
            "houses": house_list,
            "total_count": total_count,
            "page": page,
            "limit": limit,
            "total_pages": (total_count // limit) + (1 if total_count % limit > 0 else 0)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

