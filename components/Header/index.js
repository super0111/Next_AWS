import * as React from 'react';
import Router from "next/router";
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';
import { useEffect } from 'react';
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import HomeIcon from '@mui/icons-material/Home'
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MoreIcon from '@mui/icons-material/MoreVert';
import {makeSelectSearchText} from '../../containers/selectors';
import {setSearchText} from '../../containers/actions';
import { Auth, Hub } from 'aws-amplify';
import Amplify from '@aws-amplify/core';
import awsconfig from '../../aws-export';
import { mainListItems } from './listItems';

Amplify.configure(awsconfig);

// const drawerWidth = 240;
const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '20ch',
        },
    },
}));
const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        width: '100%',
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));



const Header = ({
    open,
    setOpen,
    onSetSearchText,
    searchText
}) => {
    const [user, setUser] = React.useState(null);
    const menuId = 'primary-search-account-menu';
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
    const [localSearchText, setLocalSearchText] = React.useState('');
    const isMenuOpen = Boolean(anchorEl);
    const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

    React.useEffect(() => {
        if (searchText === '') {
            setLocalSearchText('')
        }
    }, [searchText])
    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMobileMenuClose = () => {
        setMobileMoreAnchorEl(null);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        handleMobileMenuClose();
    };
    const handleMobileMenuOpen = (event) => {
        setMobileMoreAnchorEl(event.currentTarget);
    };
    const mobileMenuId = 'primary-search-account-menu-mobile';
    const renderMobileMenu = (
        <Menu
            anchorEl={mobileMoreAnchorEl}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            id={mobileMenuId}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={isMobileMenuOpen}
            onClose={handleMobileMenuClose}
        >
            <MenuItem>
                <IconButton
                    size="large"
                    aria-label="show 17 new notifications"
                    color="inherit"
                >
                    <Badge badgeContent={17} color="error">
                        <NotificationsIcon />
                    </Badge>
                </IconButton>
                <p>Notifications</p>
            </MenuItem>
            <MenuItem onClick={handleProfileMenuOpen}>
                <IconButton
                    size="large"
                    aria-label="account of current user"
                    aria-controls="primary-search-account-menu"
                    aria-haspopup="true"
                    color="inherit"
                >
                    <AccountCircle />
                </IconButton>
                <p>Profile</p>
            </MenuItem>
        </Menu>
    );
    const handleClickLogIn = () => {
        Auth.federatedSignIn()
            .then(() => {
                handleMenuClose();
            })
            .catch(err => console.log(err));
        handleMenuClose();
    }
    const handleClickLogOut = () => {
        Router.push('/logout');
    }
    const renderMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            id={menuId}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={isMenuOpen}
            onClose={handleMenuClose}
            style={{ marginTop: 50, marginRight: 30 }}
        >
            {user ?
                [
                    <MenuItem className="account-menu" key="family_name">{user.attributes.given_name} {user.attributes.family_name}</MenuItem>,
                    <MenuItem className="account-menu" key="email">{user.attributes.email}</MenuItem>,
                    <MenuItem className="account-menu" key="logout" onClick={handleClickLogOut}>Logout</MenuItem>,
                    <MenuItem className="account-menu" key="settings" >Settings</MenuItem>,
                    <MenuItem className="account-menu" key="subscription" >Subscription</MenuItem>,
                ]
                :
                <MenuItem onClick={handleClickLogIn}>Sign In</MenuItem>
            }
        </Menu>
    );
    useEffect(() => {
        Hub.listen('auth', ({ payload: { event, data } }) => {
            switch (event) {
                case 'signIn':
                case 'cognitoHostedUI':
                    getUser().then(userData => setUser(userData));
                    break;
                case 'signOut':
                    setUser(null);
                    break;
                case 'signIn_failure':
                case 'cognitoHostedUI_failure':
                    break;
            }
        });

        getUser().then(userData => setUser(userData));
    }, []);
    const getUser = () => {
        return Auth.currentAuthenticatedUser()
            .then(userData => userData)
            .catch(() => console.log('Not signed in'));
    }

    const handleChangeValue = (e) => {
        e.preventDefault();
        setLocalSearchText(e.target.value)
    }
    const dispatchSearchText = (e) => {
        if (e.key === 'Enter') {
            onSetSearchText(localSearchText)
        }
    }
    const handleMovePage = (e) => {
        e.preventDefault();
        Router.push("/create-model");
    }
    return (
        <Box>
            <AppBar position="absolute" open={open} style={{ boxShadow: "rgb(4 17 29 / 25%) 0px 0px 8px 0px" }}>
                <Toolbar
                    sx={{
                        pr: '24px', // keep right padding when drawer closed
                        backgroundColor: "white",
                    }}
                >
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="open drawer"
                        onClick={setOpen}
                    >
                    </IconButton>
                    <Typography
                        display= "flex"
                        justifyContent= "first"
                        component="h1"
                        variant="h6"
                        color="black"
                        fontWeight= "900"
                        noWrap
                        sx={{ flexGrow: 1, fontSize: 25 }}
                    >
                        <HomeIcon className="" style={{ fontSize: 37, marginRight: 11, color: "rgb(21, 134, 209)" }}/>
                        TransferHub
                    </Typography>
                    <Search style={{ color: "black", width: "45%" }} className="search mr-2"
                        sx={{
                            
                        }}
                    >
                        <SearchIconWrapper >
                            <SearchIcon style={{ marginBottom: "20px" }} />
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder="Search…"
                            inputProps={{ 'aria-label': 'search' }}
                            value={localSearchText}
                            onChange={(e) => handleChangeValue(e)}
                            onKeyPress={(e) => dispatchSearchText(e)}
                        />
                    </Search>

                    <Box className="d-flex flex-row ml-3">
                        {mainListItems}
                    </Box>

                    <Box sx={{ flexGrow: 0.3 }} />
                    <Box 
                        sx={{ 
                            display: { md: 'flex' }, 
                            color: "rgb(23, 127, 196)",
                            }}
                    >
                        <IconButton
                            size="large"
                            aria-label="show 17 new notifications"
                            color="inherit"
                            onClick={(e) => {
                                handleMovePage(e)
                            }}
                        >
                            <LibraryAddIcon />
                        </IconButton>
                        <IconButton
                            size="large"
                            aria-label="show 17 new notifications"
                            color="inherit"
                        >
                            <Badge badgeContent={17} color="error">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>
                        <IconButton
                            size="large"
                            edge="end"
                            aria-label="account of current user"
                            aria-controls={menuId}
                            aria-haspopup="true"
                            onClick={handleProfileMenuOpen}
                            color="inherit"
                        >
                            <AccountCircle />
                        </IconButton>
                    </Box>
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, marginRight: 20 }}>
                        <IconButton
                            size="large"
                            aria-label="show more"
                            aria-controls={mobileMenuId}
                            aria-haspopup="true"
                            onClick={handleMobileMenuOpen}
                            color="inherit"
                        >
                            <MoreIcon />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar >
            {renderMobileMenu}
            {renderMenu}
        </Box>
    );
}


const mapStateToProps = createStructuredSelector({
    searchText: makeSelectSearchText(),
});

function mapDispatchToProps(dispatch) {
    return {
        onSetSearchText: (text) => dispatch(setSearchText(text)),
    };
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);
export default compose(withConnect)(Header);
