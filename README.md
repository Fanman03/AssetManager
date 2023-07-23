# AssetManager
A simple, locally-hosted asset management platform

## Setup
AssetMgr is designed to run as a Docker container. The following docker-compose file can be used as a starting point.
```yaml
version: '3'
services:
  assetmgr:
    image: 'fanman03/assetmgr:1.1.0'
    restart: always
    container_name: "assetmgr"
    ports:
      - '3002:3002'
    environment:
      - MONGODB_URI=mongodb+srv://your_connection_string_goes_here
      - BASE_DOMAIN=http://example.com
      - APP_NAME=Asset Management
```

## Adding Assets
Assets are represented by MongoDB objects. The following is an example asset:

```json
{
  "_id": "2A304D9",
  "Status": 1,
  "Purchase_Date": 1668664800,
  "Type": "AP",
  "Brand": "Ubiquiti",
  "Model": "U6-Pro",
  "MAC": "AA:BB:CC:DD:EE:FF",
  "Description": "Upstairs U6 Pro",
  "Image": "Ubiquiti\\U6Pro",
  "2.4GHz": "2x2 WiFi 6",
  "5Ghz": "4x4 WiFi 6",
  "Notes": "U6 Pro installed upstairs in XYZ branch office"
}
```

The following table lists commonly used asset properties. Properties in bold are required, while all others are optional. 
| Property  | Purpose |
| ------------- | ------------- |
| **_id** | Globally unique identifier for the asset. AssetMgr does not enforce any specific schema, but serial number, MAC ID, or sequential numbers are some reasonable choices. |
| **Status** | Number describing the status of the device. `0` = Spare, `1` = In Service, `2` = Retired, `3` = Sold, `4` = Lost, `5` = Stolen. |
| **Brand** | Brand name of the asset. |
| **Model** | Model of the asset. |
| **Description** | Description of the asset. |
| Image | Image to display in the UI of the asset, from the provided [image repository](https://github.com/Fanman03/asset-images). Must be in the format `Brand\\Device`. |
| Notes | Extended information field about the asset, supports Markdown. |
| Serial_Number	| Serial number of the asset. If it is a valid Dell Service Tag, this property will be displayed as a hyperlink to the Dell page with information about the specific asset. |

Custom properties can be defined by simply creating a new property with any spaces replaced with underscores. In the example asset, the 2.4GHz and 5GHz fields are custom properties.