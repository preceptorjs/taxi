YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "ActiveWindow",
        "Alert",
        "Browser",
        "Connection",
        "Cookie",
        "CookieStorage",
        "Driver",
        "Element",
        "Frame",
        "GlobalMouse",
        "GlobalTouch",
        "IME",
        "Keys",
        "LocalStorage",
        "LogEntry",
        "Mouse",
        "Navigator",
        "Session",
        "SessionStorage",
        "Status",
        "Taxi",
        "TimeOut",
        "Touch",
        "WindowHandler"
    ],
    "modules": [
        "Core",
        "Interaction",
        "Navigation",
        "Storage",
        "System",
        "Taxi",
        "WebDriver"
    ],
    "allModules": [
        {
            "displayName": "Core",
            "name": "Core",
            "description": "Core components of the system"
        },
        {
            "displayName": "Interaction",
            "name": "Interaction",
            "description": "Peripheral interactions"
        },
        {
            "displayName": "Navigation",
            "name": "Navigation",
            "description": "Navigation classes"
        },
        {
            "displayName": "Storage",
            "name": "Storage",
            "description": "Storage related classes"
        },
        {
            "displayName": "System",
            "name": "System",
            "description": "System classes - internals"
        },
        {
            "displayName": "Taxi",
            "name": "Taxi",
            "description": "Create a new browser session\n\n<img src=\"../../objectReference.png\" />\n\nNote: Remember to call `.dispose()` at the end to terminate the session."
        },
        {
            "displayName": "WebDriver",
            "name": "WebDriver",
            "description": "Web-Driver objects"
        }
    ]
} };
});