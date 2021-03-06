import {Box, Button, Card, Grid, Modal, Rating, Stack, TextField, Typography} from "@mui/material";
import React from "react";
import * as generalActions from "../../../../redux/general/actions";
import * as snackBarActions from "../../../../redux/snackbar/actions";
import {SnackBarType} from "../../../../utils/enumerates";
import {connect} from "react-redux";
import history from "../../../../history";
import {Task} from "../../../../type";
import "./../index.scss";
import taskAPI from "../../../../api/taskAPI";

const modalStyle: any = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 2,
  textAlign: "center",
};

const mapDispatcherToProps =
  (dispatch: any): ITaskListPropsFromDispatch => {
    return {
      showSnackBar: (pMsg: string, pDuration: number, pType: SnackBarType) => dispatch(snackBarActions.showSnackBar(pMsg, pDuration, pType)),
      showTopLoading: () => dispatch(generalActions.showTopLoading()),
      hideTopLoading: () => dispatch(generalActions.hideTopLoading()),
    }
  }

interface ITaskListPropsFromDispatch {
  showTopLoading?: () => void;
  hideTopLoading?: () => void;
  showSnackBar?: (pMsg: string, pDuration: number, pType: SnackBarType) => void;
}

type ITaskListProps = ITaskListPropsFromDispatch;

interface ITaskListState {
  tasks: Task[];
  searchContent: string;
  categoryFilter: number;
  hasBonusFilter: number;
  modalTask?: Task;
  showRatingModal: boolean;
  rating?: number;
  comment?: string;
}

@(connect(null, mapDispatcherToProps) as any)
export default class TaskList extends React.Component<ITaskListProps, ITaskListState> {
  constructor(props: ITaskListProps) {
    super(props);
    this.state = {
      tasks: [],
      searchContent: "",
      categoryFilter: -1,
      hasBonusFilter: -1,
      showRatingModal: false,
    }
  }

  componentDidMount() {
    this.props.showTopLoading!();
    this.loadData();
  }

  private loadData = () => {
    taskAPI.getAllTasks().then(res => {
      // TODO: validate
      if (res.status && res.status === 200 && res.data && res.data.total && res.data.results) {
        this.setState({
          tasks: res.data.results,
        })
      }
    }).finally(() => this.props.hideTopLoading!())
  }

  render() {
    const {
      tasks,
      searchContent,
      hasBonusFilter,
      categoryFilter,
    } = this.state;

    return <Stack direction={"column"} spacing={"20px"}>
      <Typography
        variant={`h5`}
        sx={{color: "#5c9bcb", textAlign: "center"}}
      >
        QU???N L?? C??NG VI???C
      </Typography>
      <Typography variant="h5" sx={{fontWeight: 400}}>Danh s??ch y??u c???u</Typography>
      {this.renderPendingTasks()}
      <Typography variant="h5" sx={{fontWeight: 400}}>C??ng vi???c ??ang th???c hi???n</Typography>
      {this.renderInProgressTasks()}
      <Typography variant="h5" sx={{fontWeight: 400}}>C??ng vi???c ???? ho??n th??nh</Typography>
      {this.renderDoneTasks()}
      {this.renderRatingModal()}
    </Stack>
  }

  private renderPendingTasks = () => {
    const {tasks} = this.state;
    const pendingTasks = tasks.filter(task => !task.accepted);
    return tasks.length ? (pendingTasks.length ?
      <Grid spacing={2} sx={{overflowY: "auto", flexGrow: 1,}}>
        {pendingTasks.map((task: Task, taskIdx: number) => {
          return <Card
            key={taskIdx}
            sx={{p: 2, ml: 1, mr: 1, mb: 1, mt: 1, display: "inline-block", width: "300px"}}
          >
            <Typography variant={`body1`}>{task.job.name}</Typography>
            <Typography variant={`body1`} sx={{mt: "20px", fontWeight: 300}}>
              Qu???n l??: {task.job.requester.full_name} <br/>
              Deadline: 10 ng??y <br/>
              S??? l?????ng ????n v??? d??? li???u: {task.unit_qty} <br/>
              Thu nh???p: {task.unit_qty * task.job.unit_wage} VND <br/>
              Tr???ng th??i: Ch??a ???????c ch???p nh???n
            </Typography>
            <Box>
              <Button
                variant={`contained`}
                color={`error`}
                sx={{m: "20px auto 0", display: `block`}}
              >
                H???y y??u c???u
              </Button>
            </Box>
          </Card>
        })}
      </Grid> : <Typography variant={`body1`} sx={{fontWeight: 300}}>
        Hi???n t???i kh??ng c?? y??u c???u n??o ??ang ch??? ph?? duy???t.
      </Typography>) : <Typography variant={`body1`} sx={{fontWeight: 300}}>
      Hi???n t???i kh??ng c?? y??u c???u n??o. Vui l??ng g???i y??u c???u ????? nh???n vi???c
    </Typography>
  }

  private renderInProgressTasks = () => {
    const {tasks} = this.state;
    const inProgressTasks = tasks.filter(task => task.accepted && !task.is_submitted);
    return tasks.length ? (inProgressTasks.length ?
      <Grid spacing={2} sx={{overflowY: "auto", flexGrow: 1,}}>
        {inProgressTasks.map((task: Task, taskIdx: number) => {
          return <Card
            key={taskIdx}
            sx={{p: 2, ml: 1, mr: 1, mb: 1, mt: 1, display: "inline-block", width: "300px"}}
          >
            <Typography variant={`body1`}>{task.job.name}</Typography>
            <Typography variant={`body1`} sx={{fontWeight: 300}}>
              Qu???n l??: {task.job.requester.full_name} <br/>
              Deadline: 10 ng??y <br/>
              Ti???n ?????: {task.labeled_unit}/{task.unit_qty} ????n v??? d??? li???u <br/>
              Tr???ng th??i: {task.is_submitted ? `Ho??n th??nh` : `Ch??a ho??n th??nh`}
            </Typography>
            <Box>
              <Button
                variant={`contained`}
                sx={{m: "20px auto 0", display: `block`}}
                onClick={() => history.push(`/annotator/workplace/${task.id}/page/1`)}
              >
                B???t ?????u/Ti???p t???c g??n nh??n
              </Button>
            </Box>
          </Card>
        })}
      </Grid> : <Typography variant={`body1`} sx={{fontWeight: 300}}>
        Hi???n t???i b???n ch??a ???????c ph??n c??ng vi???c l??m n??o.
      </Typography>) : <Typography variant={`body1`} sx={{fontWeight: 300}}>
      Hi???n t???i kh??ng c?? y??u c???u n??o. Vui l??ng g???i y??u c???u ????? nh???n vi???c
    </Typography>
  }

  private renderDoneTasks = () => {
    const {tasks} = this.state;
    const doneTasks = tasks.filter(task => task.is_submitted);
    return tasks.length ? (doneTasks.length ?
      <Grid spacing={2} sx={{overflowY: "auto", flexGrow: 1,}}>
        {doneTasks.map((task: Task, taskIdx: number) => {
          return <Card
            key={taskIdx}
            sx={{p: 2, ml: 1, mr: 1, mb: 1, mt: 1, display: "inline-block", width: "300px"}}
          >
            <Typography variant={`body1`}>{task.job.name}</Typography>
            <Typography variant={`body1`} sx={{fontWeight: 300}}>
              Qu???n l??: {task.job.requester.full_name} <br/>
              Ti???n l????ng: {task.unit_qty * task.job.unit_wage} <br/>
              {task.truth_accuracy > task.job.bonus_threshold &&
                task.shared_accuracy > task.job.bonus_threshold &&
                `Ti???n th?????ng: ${task.unit_qty * task.job.bonus_threshold}`}<br/>
              Tr???ng th??i: {task.is_submitted ? `Ho??n th??nh` : `Ch??a ho??n th??nh`}
            </Typography>
            <Box>
              {task.rated ?
                <Stack spacing={1} sx={{mt: 2}}>
                  <Typography variant={`body2`} sx={{
                    fontWeight: 300, color: "#4CB050"
                  }}>
                    ???? ????nh gi??
                  </Typography>
                  <span>
									<Rating
                    style={{fontSize: "2rem"}}
                    readOnly
                    defaultValue={task.rating! / 10}
                    precision={0.1}
                  />
                  <span style={{
                    fontWeight: 500,
                    verticalAlign: "top",
                    lineHeight: "30px",
                    marginLeft: "6px"
                  }}>
                    {task.rating! / 10}
                  </span>
								</span>
                </Stack>

                : <Button
                  variant={`contained`}
                  sx={{m: "20px auto 0", display: `block`}}
                  onClick={() => this.setState({showRatingModal: true, modalTask: task})}
                >
                  ????nh gi??
                </Button>}
            </Box>
          </Card>
        })}
      </Grid> : <Typography variant={`body1`} sx={{fontWeight: 300}}>
        Hi???n t???i b???n ch??a ???????c ph??n c??ng vi???c l??m n??o.
      </Typography>) : <Typography variant={`body1`} sx={{fontWeight: 300}}>
      Hi???n t???i kh??ng c?? y??u c???u n??o. Vui l??ng g???i y??u c???u ????? nh???n vi???c
    </Typography>
  }

  private renderRatingModal = () => {
    const {modalTask} = this.state;
    return !!modalTask && <Modal
        open={this.state.showRatingModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
    >
        <Box sx={modalStyle}>
            <Stack spacing={`10px`}>
              {this.renderRatingModalName()}
              {this.renderModalRatingButtons()}
            </Stack>
        </Box>
    </Modal>
  }

  private renderRatingModalName = () => {
    const task = this.state.tasks[0]
    return <Box sx={{textAlign: "start"}}>
      <Typography variant={`h6`}>
        ????nh gi?? c??ng vi???c
      </Typography>

      <Stack sx={{mt: 2}} spacing={`7px`}>

        <Typography variant={`body2`} sx={{fontWeight: 300}}>
          Requester: {task.job.requester.full_name}
        </Typography>

        <Typography variant={`body2`} sx={{fontWeight: 300}}>
          S??? l?????ng ????n v??? d??? li???u: {task.unit_qty}
        </Typography>
        {/*<Typography variant={`body2`} sx={{ fontWeight: 300 }}>*/}
        {/*	Tr???ng th??i: {task.is_submitted ? `Ho??n th??nh` : `Ch??a ho??n th??nh`}.&nbsp;*/}
        {/*	{task.is_submitted && <span><Link*/}
        {/*		onClick={() => this.setState({*/}
        {/*			showTaskDetailModal: true,*/}
        {/*			modalTask: task,*/}
        {/*		})}*/}
        {/*	>Chi ti???t</Link></span>}*/}
        {/*</Typography>*/}
        {/*<Typography variant={`body2`} sx={{ fontWeight: 300 }}>*/}
        {/*	Ti???n ?????*/}
        {/*</Typography>*/}
        {/*<BorderLinearProgress*/}
        {/*	variant={`determinate`}*/}
        {/*	value={task.labeled_unit * 100 / task.unit_qty}*/}
        {/*/>*/}
        {/*<Typography variant={`body2`} sx={{ fontWeight: 300 }}>*/}
        {/*	???? g??n nh??n {task.labeled_unit}/{task.unit_qty} ????n v??? d??? li???u*/}
        {/*</Typography>*/}
        {task.is_submitted && <Typography variant={`body2`} sx={{fontWeight: 300}}>
            ????? ch??nh x??c Ground Truth: {task.truth_accuracy}%<br/>
            ????? ch??nh x??c ki???m tra ch??o: {task.shared_accuracy}%
        </Typography>}

        <Typography variant={`body2`} sx={{fontWeight: 300}}>
          Ti???n l????ng: {task.unit_qty * task.job.unit_wage} <br/>
          {task.truth_accuracy > task.job.bonus_threshold &&
            task.shared_accuracy > task.job.bonus_threshold &&
            `Ti???n th?????ng: ${task.unit_qty * task.job.bonus_threshold}`}
        </Typography>

        <Typography variant={`body2`} sx={{fontWeight: 300}}>
          H??y cho ch??ng t??i bi???t m???c ????? h??i l??ng c???a b???n v???
          Requester {task.job.requester.full_name}
        </Typography>
        <span>
				<Rating
          style={{fontSize: "2rem"}}
          value={this.state.rating}
          onChange={(event, newVal) => {
            this.setState({
              rating: newVal ? newVal : undefined
            })
          }}
          defaultValue={0}
          precision={0.1}
        />
				<span style={{fontWeight: 500, verticalAlign: "top", lineHeight: "30px", marginLeft: "6px"}}>
					{this.state.rating}
				</span>
				</span>


        <TextField
          className={`tf-normal`}
          id={`tf-username`}
          value={this.state.comment}
          label="????nh gi?? chi ti???t"
          variant="outlined"
          onChange={(ev) => {
            this.setState({
              comment: ev.target.value,
            })
          }}
        />
      </Stack>


    </Box>
  }


  private renderModalRatingButtons = () => {
    const {modalTask, rating, comment} = this.state;
    return !!modalTask && <Stack direction={`row-reverse`} spacing={`10px`}>
        <Button
            variant={`outlined`}
            color={`error`}
            onClick={() => {
              this.setState({showRatingModal: false, rating: undefined, comment: undefined})
            }}>
            H???y b???
        </Button>
        <Button onClick={() => {
          if (!!rating && !!modalTask) {
            this.props.showTopLoading!();
            taskAPI.rate(
              modalTask.id,
              rating * 10,
              comment ? comment : ""
            ).then(res => {
              if (res.status && res.status === 201) {
                this.props.showSnackBar!(
                  "????nh gi?? th??nh c??ng",
                  5000,
                  SnackBarType.Success
                )
                this.setState({
                  showRatingModal: false,
                  rating: undefined,
                  comment: undefined
                })
                this.loadData();

              } else {
                this.props.showSnackBar!(
                  "????nh gi?? th???t b???i!",
                  5000,
                  SnackBarType.Error
                )
              }
            }).finally(() => this.props.hideTopLoading!())
          } else {
            this.props.showSnackBar!(
              "Vui l??ng nh???p ??i???m ????nh gi??!",
              5000,
              SnackBarType.Error
            )
          }

        }
        } disabled={!modalTask.is_submitted} variant={`contained`}>
            G???i ????nh gi??
        </Button>
    </Stack>
  }
}