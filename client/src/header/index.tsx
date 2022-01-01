import {AppBar, Button, Toolbar, Typography} from "@mui/material";
import React from "react";
import "./index.scss";
import AccountCircle from '@mui/icons-material/AccountCircle';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import history from "../history";

interface IHeaderState {
	anchorEl: any;
	menuIsOpen: boolean;
}

export default class Header extends React.Component<{ inLoginScreen: boolean }, IHeaderState> {
	constructor(props: any) {
		super(props);
		this.state = {
			anchorEl: null,
			menuIsOpen: false,
		}
	}

	private handleMenuOpen = (event: any) => {
		this.setState({anchorEl: event.currentTarget, menuIsOpen: true});
	};
	private handleMenuClose = () => {
		this.setState({anchorEl: null, menuIsOpen: false});
	};
	private handleLogout = () => {
		this.setState({anchorEl: null, menuIsOpen: false});
		localStorage.setItem("loggedIn", "0");
		localStorage.setItem("userFullName", "");
		localStorage.setItem("accessToken", "")
		localStorage.setItem("refreshToken", "")
		localStorage.setItem("userId", "")
		localStorage.setItem("accessExpires", "")
		localStorage.setItem("refreshExpires", "")
		history.push("/login")
	};

	render() {
		const {inLoginScreen} = this.props;
		return (
			<AppBar position="static">
				<Toolbar className={`header-container`} sx={{p: {md: "auto 20vw"}}}>
					<div className={`div-logo-home`} onClick={() => history.push("/")}>
						<img className={`img-home`} src='/crolab_logo.png' alt='crolab_logo'/>
					</div>
					<Typography variant="h6" component="div" sx={{flexGrow: 1, display: {xs: 'none', sm: 'none', md: 'block'}}}>
						Crowdsourcing platform
					</Typography>
					<Typography component="div" sx={{flexGrow: 1, display: {xs: 'block', sm: 'block', md: 'none'}}}>
					</Typography>
					<Button color="inherit">
						Quản lý công việc
					</Button>
					<Button color="inherit">
						Danh sách yêu cầu
					</Button>
					{localStorage.getItem('loggedIn') === "1" && <Button
              color="inherit"
              onClick={this.handleMenuOpen}
          >
						{localStorage.getItem('userFullName')}
              <AccountCircle sx={{ml: 3}}/>
          </Button>}
					{localStorage.getItem('loggedIn') !== "1" && <Button
              color="inherit"
              onClick={() => {
								history.push("/login")
							}}
          >
						{`Đăng nhập`}
          </Button>}
					{localStorage.getItem('loggedIn') !== "1" && <Button
              color="inherit"
              onClick={() => {
								history.push("/register")
							}}
          >
						{`Đăng ký`}
          </Button>}
				</Toolbar>
				<Menu
					anchorEl={this.state.anchorEl}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'right',
					}}
					id={`profile-menu`}
					keepMounted
					transformOrigin={{
						vertical: 'top',
						horizontal: 'right',
					}}
					open={this.state.menuIsOpen}
					onClose={this.handleMenuClose}
				>
					<MenuItem onClick={this.handleMenuClose}>Cập nhật thông tin cá nhân</MenuItem>
					<MenuItem onClick={this.handleMenuClose}>Đổi mật khẩu</MenuItem>
					<MenuItem onClick={this.handleLogout}>Đăng xuất</MenuItem>
				</Menu>
			</AppBar>
		)
	}
}