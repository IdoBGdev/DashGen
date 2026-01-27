import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta

def generate_mock_data(rows=100):
    regions = ['North', 'South', 'East', 'West']
    products = ['Widget A', 'Widget B', 'Gadget X', 'Gadget Y', 'SuperTool']
    categories = ['Electronics', 'Home', 'Office']
    
    data = []
    base_date = datetime.now() - timedelta(days=rows)
    
    for i in range(rows):
        date = base_date + timedelta(days=i)
        region = random.choice(regions)
        product = random.choice(products)
        category = random.choice(categories)
        
        # Numeric data with some patterns
        sales = round(random.uniform(100, 5000) * (1.2 if region == 'North' else 1.0), 2)
        units = random.randint(1, 50)
        
        # Satisfaction (1-10) with some missing values (approx 5%)
        satisfaction = np.nan if random.random() < 0.05 else random.randint(1, 10)
        
        # Efficiency (0.0 - 1.0)
        efficiency = round(random.uniform(0.5, 1.0), 4)

        data.append({
            "Date": date.strftime("%Y-%m-%d"),
            "Region": region,
            "Product": product,
            "Category": category,
            "Sales Revenue": sales,
            "Units Sold": units,
            "Customer Satisfaction": satisfaction,
            "Operational Efficiency": efficiency
        })
        
    df = pd.DataFrame(data)
    
    # Save to CSV
    filename = "enterprise_mock_data.csv"
    df.to_csv(filename, index=False)
    print(f"Generated {filename} with {rows} rows.")

if __name__ == "__main__":
    generate_mock_data(200)
