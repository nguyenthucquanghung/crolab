import {AlertColor, Tooltip, tooltipClasses, TooltipProps} from "@mui/material";
import {CategoryType, SnackBarType} from "./enumerates";
import {styled} from "@mui/material/styles";
import LinearProgress, {linearProgressClasses} from "@mui/material/LinearProgress";
import React from "react";

export default class Utils {
	public static convertSnackBarType = (pType?: SnackBarType): AlertColor => {
		switch (pType) {
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

	public static getJobCategoryString = (pCategory: CategoryType): string => {
		switch (pCategory) {
			case CategoryType.DocumentClassification:
				return "Phân loại văn bản";
			case CategoryType.SpeechToText:
				return "Chuyển đổi giọng nói thành văn bản";
		}
	}
}

export const BorderLinearProgress = styled(LinearProgress)(({theme}) => ({
	height: 10,
	borderRadius: 5,
	[`&.${linearProgressClasses.colorPrimary}`]: {
		backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
	},
	[`& .${linearProgressClasses.bar}`]: {
		borderRadius: 5,
		backgroundColor: theme.palette.mode === 'light' ? '#1a90ff' : '#308fe8',
	},
}));

export const CustomTooltip = styled(({className, ...props}: TooltipProps) => (
	<Tooltip{...props} classes={{popper: className}}/>
))(({theme}) => ({
	[`& .${tooltipClasses.tooltip}`]: {
		backgroundColor: theme.palette.common.white,
		color: 'rgba(0, 0, 0, 0.87)',
		boxShadow: theme.shadows[1],
		fontSize: 11,
		maxWidth: 500,
	},
}));

export const modalStyle: any = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	bgcolor: 'background.paper',
	borderRadius: 2,
	boxShadow: 24,
	p: "20px",
};