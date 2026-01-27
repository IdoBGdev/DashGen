from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class ColumnSchema(BaseModel):
    name: str
    type: str  # numeric, categorical, temporal, unknown

class SchemaResponse(BaseModel):
    columns: List[ColumnSchema]
    row_count: int
    preview: List[Dict[str, Any]]

class ProcessingRequest(BaseModel):
    target_columns: List[str]
    group_by: Optional[str] = None
    filters: Optional[Dict[str, Any]] = None

class StatSummary(BaseModel):
    mean: Optional[float]
    median: Optional[float]
    std_dev: Optional[float]
    min: Optional[float]
    max: Optional[float]
    count: int

class ChartDataPoint(BaseModel):
    label: str
    value: Optional[float]
    secondary_value: Optional[float] = None

class DashboardData(BaseModel):
    stats: Dict[str, Any]  # Dict keyed by metric name, with StatSummary-like values
    chart_data: Dict[str, List[ChartDataPoint]]  # Dict keyed by metric name
    distribution_data: Dict[str, List[Dict[str, Any]]]  # Dict keyed by metric name
    leaderboard: Dict[str, List[Dict[str, Any]]]  # Dict keyed by metric name
    raw_preview: List[Dict[str, Any]]
    full_schema: List[Dict[str, Any]]

class WidgetConfig(BaseModel):
    id: str
    type: str  # kpi, bar, pie, line, table, insight
    title: str
    data_key: str
    description: Optional[str] = None
    width: str = "full"  # full, half, third

class SidebarItem(BaseModel):
    id: str
    label: str
    icon: str  # Lucide icon name

class ShellConfig(BaseModel):
    navbar_title: str
    sidebar_items: List[SidebarItem]
    primary_color: str

class PageConfig(BaseModel):
    id: str
    title: str
    summary: str
    widgets: List[WidgetConfig]

class MultiPageConfig(BaseModel):
    shell: ShellConfig
    pages: List[PageConfig]

class GenerateConfigRequest(BaseModel):
    target_columns: List[str]
    group_by: Optional[str] = None
    stats: Dict[str, Any]
    data_preview: List[Dict[str, Any]]
    full_schema: List[Dict[str, Any]]  # List of {name, type, sample_values}
    chart_keys: Optional[List[str]] = None # List of available chart data keys (e.g. "Sales by Region")
