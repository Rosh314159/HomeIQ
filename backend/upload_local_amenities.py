import pandas as pd
from models import db, School, Shop, TransportStop, PostcodeLocation
from app import app

DATA_PATH = 'C:\\Users\\rosh0\\cs\\HomeIQ\\backend\\data'

def import_schools():
    print("Importing schools")
    schools_df = pd.read_csv(f'{DATA_PATH}\\Schools.csv')
    
    # Normalize column names 
    schools_df.columns = schools_df.columns.str.lower()
    
    # Insert in batches
    batch_size = 1000
    records = []
    
    for _, row in schools_df.iterrows():
        school = School(
            name=row['schname'],
            postcode=row['postcode'],
            is_primary=(row['isprimary'] == 1),
            is_secondary=(row['issecondary'] == 1),
            ofsted_rating=row['ofstedrating'],
            latitude=row['latitude'],
            longitude=row['longitude']
        )
        records.append(school)
        
        if len(records) >= batch_size:
            db.session.bulk_save_objects(records)
            db.session.commit()
            records = []
    
    if records:
        db.session.bulk_save_objects(records)
        db.session.commit()
    
    print(f"Imported {schools_df.shape[0]} schools")

def import_shops():
    print("Importing shop")
    shops_df = pd.read_csv(f'{DATA_PATH}\\Shops.csv')
    #remove smaller shops
    shops_df = shops_df[shops_df['size_band'] != '< 3,013 ft2 (280m2)']
    
    batch_size = 1000
    records = []
    
    for _, row in shops_df.iterrows():
        shop = Shop(
            store_name=row['store_name'],
            size_band=row['size_band'],
            latitude=row['lat_wgs'],
            longitude=row['long_wgs']
        )
        records.append(shop)
        
        if len(records) >= batch_size:
            db.session.bulk_save_objects(records)
            db.session.commit()
            records = []
    
    if records:
        db.session.bulk_save_objects(records)
        db.session.commit()
    
    print(f"Imported {shops_df.shape[0]} shops")

def import_transport_stops():
    print("Importing transport")
    transport_df = pd.read_csv(f'{DATA_PATH}\\Transport.csv')
    transport_df = transport_df.dropna(subset=['Latitude', 'Longitude'])
    
    batch_size = 1000
    records = []
    
    for _, row in transport_df.iterrows():
        stop = TransportStop(
            stop_name=row.get('CommonName', ''),
            stop_type=row['StopType'],
            latitude=row['Latitude'],
            longitude=row['Longitude']
        )
        records.append(stop)
        
        if len(records) >= batch_size:
            db.session.bulk_save_objects(records)
            db.session.commit()
            records = []
    
    if records:
        db.session.bulk_save_objects(records)
        db.session.commit()
    
    print(f"Imported {transport_df.shape[0]} transport stops")

def import_postcode_data():
    try:
        df = pd.read_csv(f'{DATA_PATH}\\ukpostcodes.csv')
        
        required_cols = ['postcode', 'latitude', 'longitude']
        for col in required_cols:
            if col not in df.columns:
                raise ValueError(f"CSV is missing required column: {col}")
        
        # Drop rows with null values 
        df = df.dropna(subset=required_cols)
        
        # Convert to uppercase and remove spaces
        df['postcode'] = df['postcode'].str.upper().str.replace(' ', '')
        
        # Insert data in batches
        batch_size = 5000
        total_rows = len(df)
        records = []
        
        with app.app_context():
            for i, (_, row) in enumerate(df.iterrows()):
                postcode_loc = PostcodeLocation(
                    postcode=row['postcode'],
                    latitude=row['latitude'],
                    longitude=row['longitude']
                )
                records.append(postcode_loc)
                
                if len(records) >= batch_size or i == total_rows - 1:
                    db.session.bulk_save_objects(records)
                    db.session.commit()
                    records = []

            print(f"Total postcodes in database: {PostcodeLocation.query.count()}")
            
    except Exception as e:
        print(f"Error: {e}")
    
def clear_database_tables():
    try:
        print("Clearing database tables...")
        
        # Delete records from each table
        db.session.query(School).delete()
        db.session.query(Shop).delete()
        db.session.query(TransportStop).delete()
        db.session.query(PostcodeLocation).delete()
        
        # Commit the changes
        db.session.commit()
        
        # Verify tables are empty
        school_count = School.query.count()
        shop_count = Shop.query.count()
        transport_count = TransportStop.query.count()
        postcode_count = PostcodeLocation.query.count()
        
        print(f"Database tables cleared:")
        print(f"Schools: {school_count} records")
        print(f"Shops: {shop_count} records")
        print(f"Transport stops: {transport_count} records")
        print(f"Postcodes: {postcode_count} records")
    except Exception as e:
        db.session.rollback()
        print(f"Error clearing database tables: {e}")

if __name__ == "__main__":
    #call functions here that need to be run
    with app.app_context():
        clear_database_tables()
        import_postcode_data()
        import_schools()
        import_shops()
        import_transport_stops()
        