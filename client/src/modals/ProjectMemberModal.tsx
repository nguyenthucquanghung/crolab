import React, {useState, useEffect} from 'react';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import userAPI from '../api/userAPI';
import {CircularProgress} from '@mui/material';

function not(a: readonly string[], b: readonly string[]) {
	return a.filter((value) => b.indexOf(value) === -1);
}

function intersection(a: readonly string[], b: readonly string[]) {
	return a.filter((value) => b.indexOf(value) !== -1);
}

interface IProjectMemberModal {
	prjId: string
}

export default function ProjectMemberModal(props: IProjectMemberModal) {
	const [checked, setChecked] = useState<readonly string[]>([]);
	const [left, setLeft] = useState<readonly string[]>(["Vũ Thiên Trung Hiếu", "Vũ Thị Thiên Hương", "Ngô Nhật Minh"]);
	const [right, setRight] = useState<readonly string[]>(["Vũ Thị Thiên Anh"]);
	const [loading, setLoading] = useState<boolean>(false);

	const leftChecked = intersection(checked, left);
	const rightChecked = intersection(checked, right);

	useEffect(() => {
		setLoading(true);
		userAPI
			.getAllUsers()
			.then(res => {
				console.log(res);
			})
			.catch(err => {
				console.log(err);
			})
			.finally(() => {
				setLoading(false)
			})
	}, []);


	const handleToggle = (value: string) => () => {
		const currentIndex = checked.indexOf(value);
		const newChecked = [...checked];

		if (currentIndex === -1) {
			newChecked.push(value);
		} else {
			newChecked.splice(currentIndex, 1);
		}

		setChecked(newChecked);
	};

	const handleAllRight = () => {
		setRight(right.concat(left));
		setLeft([]);
	};

	const handleCheckedRight = () => {
		setRight(right.concat(leftChecked));
		setLeft(not(left, leftChecked));
		setChecked(not(checked, leftChecked));
	};

	const handleCheckedLeft = () => {
		setLeft(left.concat(rightChecked));
		setRight(not(right, rightChecked));
		setChecked(not(checked, rightChecked));
	};

	const handleAllLeft = () => {
		setLeft(left.concat(right));
		setRight([]);
	};

	const customList = (items: readonly string[]) => (
		<Paper sx={{width: 400, height: 300, overflow: 'auto'}}>
			<List dense component="div" role="list">
				{items.map((value: string) => {
					const labelId = `transfer-list-item-${value}-label`;

					return (
						<ListItem
							key={value}
							role="listitem"
							button
							onClick={handleToggle(value)}
						>
							<ListItemIcon>
								<Checkbox
									checked={checked.indexOf(value) !== -1}
									tabIndex={-1}
									disableRipple
									inputProps={{
										'aria-labelledby': labelId,
									}}
								/>
							</ListItemIcon>
							<ListItemText id={labelId} primary={`${value}`}/>
						</ListItem>
					);
				})}
				<ListItem/>
			</List>
		</Paper>
	);

	return (
		!loading ?
			<Grid container spacing={2} justifyContent="center" alignItems="center">
				<Grid item>{customList(left)}</Grid>
				<Grid item>
					<Grid container direction="column" alignItems="center">
						<Button
							sx={{my: 0.5}}
							variant="outlined"
							size="small"
							onClick={handleAllRight}
							disabled={left.length === 0}
							aria-label="move all right"
						>
							≫
						</Button>
						<Button
							sx={{my: 0.5}}
							variant="outlined"
							size="small"
							onClick={handleCheckedRight}
							disabled={leftChecked.length === 0}
							aria-label="move selected right"
						>
							&gt;
						</Button>
						<Button
							sx={{my: 0.5}}
							variant="outlined"
							size="small"
							onClick={handleCheckedLeft}
							disabled={rightChecked.length === 0}
							aria-label="move selected left"
						>
							&lt;
						</Button>
						<Button
							sx={{my: 0.5}}
							variant="outlined"
							size="small"
							onClick={handleAllLeft}
							disabled={right.length === 0}
							aria-label="move all left"
						>
							≪
						</Button>
					</Grid>
				</Grid>
				<Grid item>{customList(right)}</Grid>
			</Grid>
			:
			<CircularProgress/>

	);
}
