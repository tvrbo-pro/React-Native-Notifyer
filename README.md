### React Native overlay messages

-----------------------

Pure Jacascript solution.

## Usage

```javascript
	import {
		showToast,
		showNotification,
		showLoading,
		hideLoading,
		hide
	} from 'react-native-overlay-messages';
```

## Examples

### Loading

```javascript
showLoading("The content has been updated", "My App");

hideLoading(); // later on
```

![loading-full](./images/loading-full.png)

```javascript
showLoading("The content has been updated");

hideLoading(); // later on
```

![loading-mid](./images/loading-mid.png)

```javascript
var id = showLoading()

hideLoading(); // later on
```

![loading-sm](./images/loading-sm.png)

### Notifications

```javascript
var id = showNotification("The content has been updated", "My App");
// var id = showNotification("The content has been updated", "My App", { duration: 10000, ... });

hide(id); // optional
```


![notification-full](./images/notification-full.png)

```javascript
var id = showNotification("The content has been updated");
// var id = showNotification("The content has been updated", { duration: 10000, ... });

hide(id); // optional
```

![notification-simple](./images/notification-simple.png)

### Toast

```
var id = showToast("The content has been updated");

hide(id); // optional
```

![toast](./images/toast.png)
