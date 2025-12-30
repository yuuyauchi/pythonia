# Pyodideで利用可能なライブラリ

## ✅ 標準で利用可能なパッケージ

Pyodide v0.24.1にプリインストールされているパッケージ:

### 科学計算・データ分析
- `numpy` - 数値計算
- `pandas` - データ分析
- `matplotlib` - グラフ作成
- `scipy` - 科学計算
- `scikit-learn` - 機械学習

### Web関連
- `beautifulsoup4` - HTMLパーサー (micropip経由)
- `html5lib` - HTML5パーサー (micropip経由)
- `lxml` - XMLパーサー

### その他
- `pillow` - 画像処理
- `sqlite3` - データベース (標準ライブラリ)
- `datetime` - 日時処理 (標準ライブラリ)
- `pathlib` - ファイルパス (標準ライブラリ)
- `json` - JSON処理 (標準ライブラリ)
- `re` - 正規表現 (標準ライブラリ)

## ⚠️ 利用できない/制限があるパッケージ

### 完全に利用不可
- `requests` - HTTP通信 (C拡張のため)
  - **代替**: `pyodide.http.pyfetch` または標準ライブラリの`urllib`
- `opencv-python` - C++ベースのため不可
- `tensorflow`, `pytorch` - サイズとC++依存のため不可
- `discord.py` - 非同期IOとC拡張のため不可
- `openpyxl` - 一部機能が制限される可能性

### 制限付きで利用可能
- ファイルシステム操作 - 仮想ファイルシステムのみ
- ネットワーク通信 - CORS制限あり
- マルチスレッド - Web Workerを使う必要がある

## 🔧 推奨される代替案

### HTTP通信の代替

#### 従来のrequests
```python
import requests
response = requests.get("https://api.example.com/data")
```

#### Pyodideでの代替 (方法1: urllib)
```python
from urllib.request import urlopen
import json

with urlopen("https://api.example.com/data") as response:
    data = json.loads(response.read())
```

#### Pyodideでの代替 (方法2: シミュレート)
```python
# デモ・学習用にモックデータを使用
mock_weather_data = {
    "weather": [{"description": "晴れ"}],
    "main": {"temp": 25, "humidity": 60}
}
print("天気:", mock_weather_data["weather"][0]["description"])
print("気温:", mock_weather_data["main"]["temp"], "°C")
```

## 💡 コース設計の推奨事項

### 初級コース
- 標準ライブラリのみ使用
- 外部APIは**モックデータ**で代替
- ファイル操作は仮想FSで実演

### 中級コース
- `beautifulsoup4`でWebスクレイピング (静的HTML)
- `pandas`でデータ分析
- `sqlite3`でデータベース
- `matplotlib`でグラフ作成

### 上級コース
- `numpy`/`pandas`で本格的なデータ分析
- `scikit-learn`で機械学習入門
- `PIL`で画像処理

## 📝 実装時の注意

1. **パッケージロードは非同期**
   ```python
   import micropip
   await micropip.install('package-name')
   ```

2. **モックデータの活用**
   実際のAPI呼び出しができない場合は、学習用にモックデータを提供

3. **代替ライブラリの提案**
   理想のライブラリが使えない場合、学習目的を達成できる代替手段を提示
