import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional
import io

class DataProcessor:
    def __init__(self, df: pd.DataFrame):
        self.df = df

    @classmethod
    def from_bytes(cls, contents: bytes, filename: str):
        if filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        elif filename.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise ValueError("Unsupported file format")
        return cls(df)

    def get_schema(self) -> Dict[str, Any]:
        columns = []
        for col in self.df.columns:
            dtype = str(self.df[col].dtype)
            cat_type = "unknown"
            if "int" in dtype or "float" in dtype:
                cat_type = "numeric"
            elif "datetime" in dtype:
                cat_type = "temporal"
            elif "object" in dtype or "category" in dtype:
                cat_type = "categorical"
            
            columns.append({"name": col, "type": cat_type})
        
        return {
            "columns": columns,
            "row_count": len(self.df),
            "preview": self.df.head(10).to_dict(orient='records')
        }

    @staticmethod
    def _safe_float(val):
        if pd.isna(val) or np.isinf(val):
            return None
        return float(val)

    def process(self, target_cols: List[str], group_by: Optional[str] = None) -> Dict[str, Any]:
        results = {
            "stats": {},
            "chart_data": {},
            "distribution_data": {},
            "leaderboard": {},
            "raw_preview": self.df.head(50).fillna("").to_dict(orient='records')
        }

        for target_col in target_cols:
            if target_col not in self.df.columns:
                continue
                
            series = self.df[target_col].dropna()
            # Convert series to numeric, coercing errors to NaN, then drop NaNs again just in case
            series = pd.to_numeric(series, errors='coerce').dropna()
            
            if series.empty:
                continue

            # Stats for this KPI
            results["stats"][target_col] = {
                "mean": self._safe_float(series.mean()),
                "median": self._safe_float(series.median()),
                "std_dev": self._safe_float(series.std()),
                "min": self._safe_float(series.min()),
                "max": self._safe_float(series.max()),
                "count": int(len(series))
            }

            # Auto-detect dimensions (categorical/object/int columns with low cardinality)
            potential_groups = []
            if group_by and group_by in self.df.columns:
                potential_groups.append(group_by)
            
            for col in self.df.columns:
                if col == group_by:
                    continue
                #Check cardinality
                if self.df[col].nunique() < 50:
                     potential_groups.append(col)

            # Generate Chart Data for ALL detected dimensions
            for group_col in list(set(potential_groups)):
                 try:
                    grouped = self.df.groupby(group_col)[target_col].mean().reset_index()
                    # Key format: "Sales Revenue by Region"
                    key = f"{target_col} by {group_col}"
                    results["chart_data"][key] = [
                        {"label": str(row[group_col]), "value": self._safe_float(row[target_col])}
                        for _, row in grouped.head(20).iterrows()
                    ]
                    
                    # Also populate leaderboard for this combo
                    results["leaderboard"][key] = (
                        self.df.groupby(group_col)[target_col]
                        .mean()
                        .sort_values(ascending=False)
                        .head(10)
                        .reset_index()
                        .fillna("")
                        .to_dict(orient='records')
                    )
                 except Exception as e:
                     print(f"Skipping grouping {target_col} by {group_col}: {e}")

            # Legacy/Fallback (using the primary group_by if exists, or just the first generated one)
            primary_key = f"{target_col} by {group_by}" if group_by else list(results["chart_data"].keys())[0] if results["chart_data"] else None
            
            if primary_key and primary_key in results["chart_data"]:
                 # Keep standard keys for simple views if needed, but the AI should prefer the specific keys
                 # We won't overwrite the specific keys, just ensure 'chart_data' has mostly specific keys now.
                 pass

            # Distribution (Unchanged)
            try:
                counts, bins = np.histogram(series, bins=10)
                results["distribution_data"][target_col] = [
                    {"label": f"{bins[i]:.1f}-{bins[i+1]:.1f}", "value": int(counts[i])}
                    for i in range(len(counts))
                ]
            except Exception:
                results["distribution_data"][target_col] = []

        # Compatibility for legacy templates (using the first chosen KPI)
        if target_cols:
            first = target_cols[0]
            if first in results["stats"]:
                results["stats"] = {**results["stats"][first], **results["stats"]}
            results["chart_data_legacy"] = results["chart_data"].get(first, [])
            results["leaderboard_legacy"] = results["leaderboard"].get(first, [])

        # Full Schema Metadata for LLM Context
        full_schema = []
        for col in self.df.columns:
            dtype = str(self.df[col].dtype)
            cat_type = "numeric" if "int" in dtype or "float" in dtype else "temporal" if "datetime" in dtype else "categorical"
            
            sample_values = []
            if cat_type == "categorical":
                sample_values = [str(v) for v in self.df[col].dropna().unique()[:5]]
            
            full_schema.append({
                "name": col,
                "type": cat_type,
                "sample_values": sample_values
            })
        results["full_schema"] = full_schema

        return results
