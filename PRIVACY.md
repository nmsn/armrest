# Privacy Policy / 隐私权政策

**Last updated: 2026-04-28**

## English

### Data Collection

Armrest does **not** collect, store, or transmit any personal data to third parties.

### Data Storage

All data is stored locally on your device using Chrome's built-in storage APIs:

- **`chrome.storage.sync`** — Bookmarks, read-later list, and theme preferences are synced across your devices via your Google account, as provided by Chrome's standard sync mechanism. This data is not accessible to us.
- **`chrome.storage.local`** — Cached weather data, word lookup history, and authentication tokens are stored only on your local device.

### Geolocation

When you grant the `geolocation` permission, your location is used **solely** to display local weather information on the new tab page. Coordinates are sent to our backend API (hosted on Cloudflare Workers) for weather retrieval only and are not logged, stored, or shared with any third party.

If geolocation is unavailable or denied, the extension falls back to a default city.

### External Communications

- Weather, quotes, news, and translation data are fetched from our own backend API (Cloudflare Workers).
- Bookmark favicons may be loaded from third-party CDNs (jsDelivr, Google Favicons). These are loaded as static images only; no data is transmitted.
- When you click a search or bookmark link, the extension opens a new tab to the destination you selected. This is a standard browser navigation.

### Third-Party Services

The extension does **not** use any analytics, tracking, advertising, or third-party data collection services.

### Data Sharing

We do **not** sell, trade, or share your personal data with anyone.

---

## 中文

### 数据收集

Armrest **不**收集、存储或向第三方传输任何个人数据。

### 数据存储

所有数据均使用 Chrome 内置存储 API 存储在本地设备上：

- **`chrome.storage.sync`** — 书签、稍后阅读列表和主题偏好通过 Google 账户的同步机制在您的设备之间同步。我们无法访问这些数据。
- **`chrome.storage.local`** — 缓存的天气数据、单词查询历史和认证令牌仅存储在您的本地设备上。

### 地理位置

当您授予 `geolocation` 权限后，您的位置信息**仅用于**在新标签页上显示当地天气。坐标仅发送到我们的后端 API（Cloudflare Workers）以获取天气数据，不会记录、存储或与任何第三方共享。

### 外部通信

- 天气、quote、新闻和翻译数据来自我们自己的后端 API（Cloudflare Workers）。
- 书签图标可能从第三方 CDN（jsDelivr、Google Favicons）加载。仅作为静态图像加载，不传输任何数据。
- 当您点击搜索或书签链接时，扩展程序会打开一个新标签页导航到您选择的目标。这是标准的浏览器导航行为。

### 第三方服务

本扩展**不**使用任何分析、跟踪、广告或第三方数据收集服务。

### 数据共享

我们**不**出售、交易或与任何人分享您的个人数据。
