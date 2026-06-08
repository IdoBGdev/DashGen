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
        ACT AS: Chief Data Officer & Lead UI/UX Designer for a Fortune 500 company.
        
        GOAL: Create a HIGH-DENSITY, EXECUTIVE-GRADE dashboard configuration.
        The user wants a "dashboard creating machine" - this means MAXIMAL INFORMATION DENSITY, strict structure, and deep insights.
        DO NOT generate sparse or empty pages. Every pixel must provide value.

        CONTEXT:
        - Primary Metrics (KPIs): {request.target_columns}
        - Grouping Dimension: '{request.group_by if request.group_by else "None"}'
        - AVAILABLE CHART KEYS: {request.chart_keys}
        
        DATA INTELLIGENCE:
        Schema: {json.dumps(request.full_schema, indent=2)}
        Preview: {json.dumps(request.data_preview, indent=2)}
        Statistics: {json.dumps(clean_stats, indent=2)}

        INSTRUCTIONS:
        Design a 4-6 PAGE dashboard JSON structure.
        
        PAGE 1: "EXECUTIVE SUMMARY"
        - MUST include big number KPIs for ALL primary metrics.
        - MUST include a textual "AI Executive Insight" widget explaining the overall health.
        - High-level trends (Area/Line charts) only.
        
        PAGE 2: "TREND ANALYSIS"
        - Deep dive into time-series or sequential patterns.
        - Compare metrics against each other (e.g., "Metric A vs Metric B").
        
        PAGE 3: "SEGMENTATION & DISTRIBUTION"
        - Bar charts, Pie charts, and Leaderboards.
        - Focus on the '{request.group_by}' dimension if it exists.
        
        PAGE 4: "ANOMALIES & OUTLIERS"
        - Leaderboards of top/bottom performers.
        - Distribution analysis.

        WIDGET TYPES & RULES:
        - 'kpi': Single number. Title must be descriptive.
        - 'insight': TEXT ONLY. A strategic observation derived from the stats (e.g., "Retention is down 5% in Q3").
        - 'line': Time-series or trend.
        - 'area': Volume accumulation.
        - 'bar': Categorical comparison.
        - 'pie': Composition (max 6 slices).
        - 'leaderboard': Top 5 / Bottom 5 lists.

        LAYOUT RULES:
        - width: "third" (1/3 width), "half" (1/2 width), "full" (full width).
        - MIX these widths to create a masonry-like dense grid.
        - AVOID putting 10 "full" width widgets in a row. Use "third" for KPIs and "half" for charts.
        
        JSON STRUCTURE (Strict):
        {{
            "shell": {{
                "navbar_title": "Enterprise Analytics Suite",
                "sidebar_items": [
                    {{ "id": "p1", "label": "Executive Summary", "icon": "LayoutDashboard" }},
                    {{ "id": "p2", "label": "Trend Analysis", "icon": "TrendingUp" }},
                    {{ "id": "p3", "label": "Segmentation", "icon": "PieChart" }},
                    {{ "id": "p4", "label": "Leaderboards", "icon": "Trophy" }}
                ],
                "primary_color": "#0f172a"
            }},
            "pages": [
                {{
                    "id": "p1",
                    "title": "Executive Summary",
                    "summary": "High-level strategic overview of key performance indicators.",
                    "widgets": [
                        {{ "id": "w1_1", "type": "insight", "title": "Strategic Overview", "description": "Analyzing [Metric] shows a strong positive correlation with...", "width": "full" }},
                        {{ "id": "w1_2", "type": "kpi", "title": "Total Revenue", "data_key": "stats", "width": "third" }},
                         ... (more widgets)
                    ]
                }},
                ... (more pages)
            ]
        }}
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
