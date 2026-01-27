from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import json
import pandas as pd
from data_processor import DataProcessor
from models import SchemaResponse, ProcessingRequest, DashboardData, GenerateConfigRequest, MultiPageConfig
from llm_service import llm_service
from typing import Optional, List

from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

# ... (rest of imports)

app = FastAPI(title="Dashboard Generator API")

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    print(f"Validation Error: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": exc.body},
    )

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage
storage = {"df": None}

@app.get("/")
async def root():
    return {"message": "Dashboard Generator API is running on 8001"}

@app.post("/upload", response_model=SchemaResponse)
async def upload_data(file: UploadFile = File(...)):
    print(f"--- UPLOAD REQUEST: {file.filename} ---")
    contents = await file.read()
    try:
        processor = DataProcessor.from_bytes(contents, file.filename)
        storage["df"] = processor.df
        print(f"Data stored in memory. Rows: {len(processor.df)}")
        return processor.get_schema()
    except Exception as e:
        print(f"Upload Error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/process", response_model=DashboardData)
async def process_data(request: ProcessingRequest):
    print(f"--- PROCESS REQUEST: KPIs={request.target_columns} ---")
    if storage["df"] is None:
        print("Error: No data in memory (400)")
        raise HTTPException(status_code=400, detail="No data uploaded. Please upload a file first.")
    
    try:
        processor = DataProcessor(storage["df"])
        result = processor.process(request.target_columns, request.group_by)
        print("Data processed successfully.")
        return result
    except Exception as e:
        print(f"Processing Error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/generate-config", response_model=MultiPageConfig)
async def generate_config(request: GenerateConfigRequest):
    print(f"--- GENERATE CONFIG REQUEST (AI) ---")
    try:
        config = await llm_service.generate_dashboard_config(request)
        print("AI Configuration generated.")
        return config
    except Exception as e:
        print(f"AI Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/export-csv")
async def export_csv(data: DashboardData):
    print("--- EXPORT CSV REQUEST ---")
    try:
        first_kpi = list(data.chart_data.keys())[0] if data.chart_data else "data"
        rows = [{"Label": p.label, "Value": p.value} for p in data.chart_data.get(first_kpi, [])]
        df = pd.DataFrame(rows)
        csv_content = df.to_csv(index=False)
        return {
            "csv": csv_content,
            "filename": f"dashboard_{first_kpi}.csv"
        }
    except Exception as e:
        print(f"Export Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("\n" + "="*50)
    print("DASHBOARD GENERATOR BACKEND - RUNNING ON PORT 8001")
    print("Reload is DISABLED. Data will persist in memory.")
    print("="*50 + "\n")
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=False)