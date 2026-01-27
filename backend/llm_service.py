import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
from typing import Dict, Any, List, Optional
from models import MultiPageConfig, StatSummary, GenerateConfigRequest, PageConfig, ShellConfig, SidebarItem

load_dotenv()

class LLMService:
    def __init__(self):
        # In a real scenario, the key might be in os.environ
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
             # Fallback for local dev if .env is missing or key is empty
             # In production, this should raise an error
             pass
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash')

    async def generate_dashboard_config(self, request: GenerateConfigRequest) -> MultiPageConfig:
        stats_dict = request.stats.model_dump() if hasattr(request.stats, 'model_dump') else request.stats
        # Clean stats to ensure valid JSON (replace NaN with None)
        import math
        def clean_floats(obj):
            if isinstance(obj, float):
                 return None if math.isnan(obj) or math.isinf(obj) else obj
            if isinstance(obj, dict):
                return {k: clean_floats(v) for k, v in obj.items()}
            if isinstance(obj, list):
                return [clean_floats(v) for v in obj]
            return obj
        
        clean_stats = clean_floats(stats_dict)

        prompt = f"""
        You are a Senior Data Scientist and Lead UI/UX Designer. 
        Your goal is to create a COMPREHENSIVE MULTI-KPI dashboard project.
        
        CONTEXT:
        - Primary Metrics to Analyze: {request.target_columns}
        - Current Grouping: '{request.group_by if request.group_by else "Generic"}'
        - AVAILABLE CHART KEYS (Use these for 'data_key'): {request.chart_keys}
        
        FULL DATA SCHEMA:
        {json.dumps(request.full_schema, indent=2)}
        
        DATA PREVIEW:
        {json.dumps(request.data_preview, indent=2)}
        
        CORE STATISTICS (Mapped by Metric):
        {json.dumps(clean_stats, indent=2)}
        
        TASK:
        Design a MULTI-PAGE DASHBOARD in JSON format that analyzes ALL target metrics.
        The dashboard should cater to different organizational roles (e.g., Executive, Operational, Analytical).
        
        LOGIC RULES:
        1. MULTI-KPI INTEGRATION: Every page should ideally feature insights or widgets comparing or summarizing the {len(request.target_columns)} target metrics.
        2. KPIS: Suggest logical aggregations and comparisons between metrics (e.g., "Metric A vs Metric B").
        3. PAGES:
        4. WIDGETS:
            - 'kpi': Use for single critical numbers. Ensure 'title' reflects which metric it is.
            - 'bar'/'line': Use for comparisons.
            - 'area': Use for abundance/volume.
            - 'leaderboard': Use for ranking.
            - 'insight': Provide strategic commentary on the relationship between metrics.
        
        JSON STRUCTURE (Strict Adherence Required):
        {{
            "shell": {{
                "navbar_title": "Enterprise Multi-KPI Dashboard",
                "sidebar_items": [
                    {{ "id": "p1", "label": "Executive View", "icon": "ShieldCheck" }},
                    {{ "id": "p2", "label": "Comparative Analysis", "icon": "Binary" }},
                    {{ "id": "p3", "label": "Metric Distributions", "icon": "Layers" }}
                ],
                "primary_color": "#1e40af"
            }},
            "pages": [
                {{
                    "id": "p1",
                    "title": "Executive Overview",
                    "summary": "High-level summary of [Metric 1] and [Metric 2] performance.",
                    "widgets": [
                         {{ "id": "w1_1", "type": "kpi", "title": "Total Revenue", "data_key": "stats", "width": "third" }},
                         {{ "id": "w1_2", "type": "bar", "title": "Revenue Trend", "data_key": "chart_data", "width": "full" }}
                    ]
                }},
                {{
                    "id": "p2",
                    "title": "Deep Dive",
                    "summary": "Detailed analysis of [Metric 1] distribution.",
                    "widgets": [ ... ]
                }}
            ]
        }}
        
        Rules:
        1. Return ONLY the JSON object.
        2. Ensure 'data_key' values are logical (stats, chart_data, leaderboard, distribution_data).
        3. Use Lucide icon names in PascalCase.
        4. Avoid using NaN or Inf in the output JSON.
        5. EVERY page MUST have a 'summary'.
        6. EVERY widget MUST have a unique 'id' and 'type'.
        """

        try:
            response = self.model.generate_content(prompt)
            # Find the JSON part in the response
            text = response.text
            start = text.find('{')
            end = text.rfind('}') + 1
            json_str = text[start:end]
            config_dict = json.loads(json_str)
            return MultiPageConfig(**config_dict)
        except Exception as e:
            print(f"LLM Error: {e}")
            # Return a default multi-page config if LLM fails
            main_kpi = request.target_columns[0] if request.target_columns else "Data"
            return MultiPageConfig(
                shell=ShellConfig(
                    navbar_title=f"{main_kpi} Dash",
                    sidebar_items=[
                        SidebarItem(id="p1", label="Overview", icon="LayoutDashboard"),
                        SidebarItem(id="p2", label="Detailed", icon="BarChart3")
                    ],
                    primary_color="#3b82f6"
                ),
                pages=[
                    PageConfig(
                        id="p1",
                        title="Overview",
                        summary="General overview of your data metrics.",
                        widgets=[
                            {"id": "w1", "type": "kpi", "title": "Average", "data_key": "stats", "width": "third"},
                            {"id": "w2", "type": "bar", "title": "Chart", "data_key": "chart_data", "width": "full"}
                        ]
                    ),
                    PageConfig(
                        id="p2",
                        title="Detailed Analysis",
                        summary="Deeper exploration of categories.",
                        widgets=[
                            {"id": "w3", "type": "pie", "title": "Distribution", "data_key": "leaderboard", "width": "half"}
                        ]
                    )
                ]
            )

llm_service = LLMService()
