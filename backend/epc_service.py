import pandas as pd
import urllib.request
import io
import csv
from urllib.parse import urlencode
import os
from dotenv import load_dotenv
from models import PostcodeLocation, db

load_dotenv()
# EPC API details
token = os.getenv("EPC_API")
base_url = 'https://epc.opendatacommunities.org/api/v1/domestic/search'
headers = {
    'Accept': 'text/csv',
    'Authorization': f'Basic {token}'
}

# Function to get EPC data for a property
def get_latest_epc(postcode, house_number_or_name):
    print("Fetching")
    address = house_number_or_name.strip()

    params = {
        'postcode': postcode,
        'address': address,
        'size': 1,  # Fetch only the most recent EPC record
        'page': 1
    }
    encoded_params = urlencode(params)
    full_url = f"{base_url}?{encoded_params}"

    try:
        with urllib.request.urlopen(urllib.request.Request(full_url, headers=headers)) as response:
            response_body = response.read().decode()
            csv_data = list(csv.reader(io.StringIO(response_body)))
            headers1 = csv_data[0]  # First row as headers
            values = csv_data[1]   # Second row as values
            epc_df = pd.DataFrame([values], columns=headers1)

            # Get coordinates from database
            cleaned_postcode = postcode.upper().replace(' ', '')
            coords = get_coordinates_from_db(cleaned_postcode)
            epc_df['latitude'] = coords[0]
            epc_df['longitude'] = coords[1]
        
            return epc_df
    except Exception as e:
        return(f"Error fetching EPC data: {e}")

def get_coordinates_from_db(postcode):

    # Remove spaces and convert to uppercase for consistent lookup
    cleaned_postcode = postcode.upper().replace(' ', '')
    
    try:
        location = PostcodeLocation.query.filter_by(postcode=cleaned_postcode).first()
        if location:
            return (location.latitude, location.longitude)
        else:
            # Try with just the first part of the poscode
            outward_code = cleaned_postcode.split(maxsplit=1)[0]
            # Find any postcode with the same first part as an approximation
            location = PostcodeLocation.query.filter(
                PostcodeLocation.postcode.startswith(outward_code)
            ).first()
            if location:
                return (location.latitude, location.longitude)
        return None
    except Exception as e:
        print(f"Database error when looking up coordinates: {e}")
        return None