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
        QUẢN LÝ CÔNG VIỆC
      </Typography>
      <Typography variant="h5" sx={{fontWeight: 400}}>Danh sách yêu cầu</Typography>
      {this.renderPendingTasks()}
      <Typography variant="h5" sx={{fontWeight: 400}}>Công việc đang thực hiện</Typography>
      {this.renderInProgressTasks()}
      <Typography variant="h5" sx={{fontWeight: 400}}>Công việc đã hoàn thành</Typography>
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
              Quản lý: {task.job.requester.full_name} <br/>
              Deadline: 10 ngày <br/>
              Số lượng đơn vị dữ liệu: {task.unit_qty} <br/>
              Thu nhập: {task.unit_qty * task.job.unit_wage} VND <br/>
              Trạng thái: Chưa được chấp nhận
            </Typography>
            <Box>
              <Button
                variant={`contained`}
                color={`error`}
                sx={{m: "20px auto 0", display: `block`}}
              >
                Hủy yêu cầu
              </Button>
            </Box>
          </Card>
        })}
      </Grid> : <Typography variant={`body1`} sx={{fontWeight: 300}}>
        Hiện tại không có yêu cầu nào đang chờ phê duyệt.
      </Typography>) : <Typography variant={`body1`} sx={{fontWeight: 300}}>
      Hiện tại không có yêu cầu nào. Vui lòng gửi yêu cầu để nhận việc
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
              Quản lý: {task.job.requester.full_name} <br/>
              Deadline: 10 ngày <br/>
              Tiến độ: {task.labeled_unit}/{task.unit_qty} đơn vị dữ liệu <br/>
              Trạng thái: {task.is_submitted ? `Hoàn thành` : `Chưa hoàn thành`}
            </Typography>
            <Box>
              <Button
                variant={`contained`}
                sx={{m: "20px auto 0", display: `block`}}
                onClick={() => history.push(`/annotator/workplace/${task.id}/page/1`)}
              >
                Bắt đầu/Tiếp tục gán nhãn
              </Button>
            </Box>
          </Card>
        })}
      </Grid> : <Typography variant={`body1`} sx={{fontWeight: 300}}>
        Hiện tại bạn chưa được phân công việc làm nào.
      </Typography>) : <Typography variant={`body1`} sx={{fontWeight: 300}}>
      Hiện tại không có yêu cầu nào. Vui lòng gửi yêu cầu để nhận việc
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
              Quản lý: {task.job.requester.full_name} <br/>
              Tiền lương: {task.unit_qty * task.job.unit_wage} <br/>
              {task.truth_accuracy > task.job.bonus_threshold &&
                task.shared_accuracy > task.job.bonus_threshold &&
                `Tiền thưởng: ${task.unit_qty * task.job.bonus_threshold}`}<br/>
              Trạng thái: {task.is_submitted ? `Hoàn thành` : `Chưa hoàn thành`}
            </Typography>
            <Box>
              {task.rated ?
                <Stack spacing={1} sx={{mt: 2}}>
                  <Typography variant={`body2`} sx={{
                    fontWeight: 300, color: "#4CB050"
                  }}>
                    Đã đánh giá
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
                  Đánh giá
                </Button>}
            </Box>
          </Card>
        })}
      </Grid> : <Typography variant={`body1`} sx={{fontWeight: 300}}>
        Hiện tại bạn chưa được phân công việc làm nào.
      </Typography>) : <Typography variant={`body1`} sx={{fontWeight: 300}}>
      Hiện tại không có yêu cầu nào. Vui lòng gửi yêu cầu để nhận việc
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
        Đánh giá công việc
      </Typography>

      <Stack sx={{mt: 2}} spacing={`7px`}>

        <Typography variant={`body2`} sx={{fontWeight: 300}}>
          Requester: {task.job.requester.full_name}
        </Typography>

        <Typography variant={`body2`} sx={{fontWeight: 300}}>
          Số lượng đơn vị dữ liệu: {task.unit_qty}
        </Typography>
        {/*<Typography variant={`body2`} sx={{ fontWeight: 300 }}>*/}
        {/*	Trạng thái: {task.is_submitted ? `Hoàn thành` : `Chưa hoàn thành`}.&nbsp;*/}
        {/*	{task.is_submitted && <span><Link*/}
        {/*		onClick={() => this.setState({*/}
        {/*			showTaskDetailModal: true,*/}
        {/*			modalTask: task,*/}
        {/*		})}*/}
        {/*	>Chi tiết</Link></span>}*/}
        {/*</Typography>*/}
        {/*<Typography variant={`body2`} sx={{ fontWeight: 300 }}>*/}
        {/*	Tiến độ*/}
        {/*</Typography>*/}
        {/*<BorderLinearProgress*/}
        {/*	variant={`determinate`}*/}
        {/*	value={task.labeled_unit * 100 / task.unit_qty}*/}
        {/*/>*/}
        {/*<Typography variant={`body2`} sx={{ fontWeight: 300 }}>*/}
        {/*	Đã gán nhãn {task.labeled_unit}/{task.unit_qty} đơn vị dữ liệu*/}
        {/*</Typography>*/}
        {task.is_submitted && <Typography variant={`body2`} sx={{fontWeight: 300}}>
            Độ chính xác Ground Truth: {task.truth_accuracy}%<br/>
            Độ chính xác kiểm tra chéo: {task.shared_accuracy}%
        </Typography>}

        <Typography variant={`body2`} sx={{fontWeight: 300}}>
          Tiền lương: {task.unit_qty * task.job.unit_wage} <br/>
          {task.truth_accuracy > task.job.bonus_threshold &&
            task.shared_accuracy > task.job.bonus_threshold &&
            `Tiền thưởng: ${task.unit_qty * task.job.bonus_threshold}`}
        </Typography>

        <Typography variant={`body2`} sx={{fontWeight: 300}}>
          Hãy cho chúng tôi biết mức độ hài lòng của bạn về
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
          label="Đánh giá chi tiết"
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
            Hủy bỏ
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
                  "Đánh giá thành công",
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
                  "Đánh giá thất bại!",
                  5000,
                  SnackBarType.Error
                )
              }
            }).finally(() => this.props.hideTopLoading!())
          } else {
            this.props.showSnackBar!(
              "Vui lòng nhập điểm đánh giá!",
              5000,
              SnackBarType.Error
            )
          }

        }
        } disabled={!modalTask.is_submitted} variant={`contained`}>
            Gửi đánh giá
        </Button>
    </Stack>
  }
}