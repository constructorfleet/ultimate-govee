/* eslint-disable no-useless-escape */
export const spec: string = `
#include "common_props.h"

/* trunk-ignore(eslint/no-useless-escape) */
const char* _H5179_json = "{\"brand\":\"Govee\",\"model\":\"Thermo-Hygrometer\",\"model_id\":\"H5179\",\"tag\":\"0103\",\"condition\":[\"name\",\"index\",0,\"Govee_H5179\",\"&\",\"manufacturerdata\",\"=\",22,\"index\",0,\"0188ec\"],\"properties\":{\"tempc\":{\"decoder\":[\"value_from_hex_data\",\"manufacturerdata\",12,4,true,true],\"post_proc\":[\"/\",100]},\"hum\":{\"decoder\":[\"value_from_hex_data\",\"manufacturerdata\",16,4,true,false],\"post_proc\":[\"/\",100]},\"batt\":{\"decoder\":[\"value_from_hex_data\",\"manufacturerdata\",20,2,false,false]}}}";
/* R""""(
{
   "brand":"Govee",
   "model":"Thermo-Hygrometer",
   "model_id":"H5179",
   "tag":"0103",
   "condition":["name", "index", 0, "Govee_H5179", "&", "manufacturerdata", "index", 0, "0188"],
   "properties":{
      "tempc":{
         "decoder":["value_from_hex_data", "manufacturerdata", 6, 2, true, true],
         "post_proc":["/", 100]
      },
      "hum":{
         "decoder":["value_from_hex_data", "manufacturerdata", 6, 2, true, false],
         "post_proc":["/", 100]
      },
      "batt":{
         "decoder":["value_from_hex_data", "manufacturerdata", 8, 1, false, false]
      }
   }
})"""";*/

const char* _H5179_json_props = _common_BTH_props;
`;
