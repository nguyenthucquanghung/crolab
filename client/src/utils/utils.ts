import { AlertColor } from "@mui/material";
import { SnackBarType } from "./enumerates";

export default class Utils {
    public static convertSnackBarType = (pType?: SnackBarType): AlertColor => {
        switch(pType){
            case SnackBarType.Error:
                return "error";
            case SnackBarType.Warning:
                return "warning";
            case SnackBarType.Info:
                return "info";
            case SnackBarType.Success:
                return "success";
            default:
                return "info";
        }
    }
}