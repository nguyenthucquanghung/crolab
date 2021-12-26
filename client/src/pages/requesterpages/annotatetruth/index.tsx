import { Box, Button, FormControl, FormControlLabel, Grid, InputAdornment, InputLabel, MenuItem, Paper, Select, SelectChangeEvent, Stack, Switch, TextField, Typography } from "@mui/material";
import React from "react";
import * as generalActions from "../../../redux/general/actions";
import * as snackBarActions from "../../../redux/snackbar/actions";
import { CategoryType, SnackBarType } from "../../../utils/enumerates";
import { connect } from "react-redux";
import jobAPI from "../../../api/jobAPI";
import history from "../../../history";
import ReactAudioPlayer from 'react-audio-player';

const mapDispatcherToProps =
  (dispatch: any): IAnnotateTruthPropsFromDispatch => {
    return {
      showSnackBar: (pMsg: string, pDuration: number, pType: SnackBarType) => dispatch(snackBarActions.showSnackBar(pMsg, pDuration, pType)),
      showTopLoading: () => dispatch(generalActions.showTopLoading()),
      hideTopLoading: () => dispatch(generalActions.hideTopLoading()),
    }
  }

interface IAnnotateTruthPropsFromDispatch {
  showTopLoading?: () => void;
  hideTopLoading?: () => void;
  showSnackBar?: (pMsg: string, pDuration: number, pType: SnackBarType) => void;
}

type IAnnotateTruthProps = IAnnotateTruthPropsFromDispatch;
interface IAnnotateTruthState {
}

class AnnotateTruth extends React.Component<IAnnotateTruthProps, IAnnotateTruthState> {
  constructor(props: IAnnotateTruthProps) {
    super(props);
    this.state = {

    }
  }
  render() {
    return (
      <Paper sx={{
        width: "calc(100% - 80px)",
        m: "20px auto",
        flexGrow: 1,
        p: "20px",
        overflowY: "auto",
      }}>
        <Typography
          variant="h6"
        >
          Gán nhãn Ground Truth
        </Typography>
        <ReactAudioPlayer
          src="https://crolab.blob.core.windows.net/media/00b4e59b-2995-4358-b12a-0dbab89eecd8VIVOSSPK01_R190.wav"
          controls
        />
      </Paper >
    )
  }
}
export default connect(null, mapDispatcherToProps)(AnnotateTruth);