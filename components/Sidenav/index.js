import * as React from 'react';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ArrowBack from '@mui/icons-material/ArrowBack';
import FilterList from '@mui/icons-material/FilterList';

import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Checkbox from '@mui/material/Checkbox';
import Select from 'react-select';
import { createStructuredSelector } from 'reselect';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { makeSelectSearchText } from '../../containers/selectors';
import { setSearchText, setActiveModel, setDomainState, setFrameworkState, setSelectedTags } from '../../containers/actions';
import { Auth, Hub, API } from 'aws-amplify';
import Amplify from '@aws-amplify/core';
import awsconfig from '../../aws-export';
Amplify.configure(awsconfig);

const drawerWidth = "100%";
const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        '& .MuiDrawer-paper': {
            marginTop: 62,
            position: 'relative',
            whiteSpace: 'nowrap',
            width: drawerWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
            boxSizing: 'border-box',
            ...(!open && {
                overflowX: 'hidden',
                transition: theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                width: theme.spacing(10),
                [theme.breakpoints.up('sm')]: {
                    width: theme.spacing(9),
                },
            }),
        },
    }),
);

    const mdTheme = createTheme();
    const SideNavBar = (props) => {
    const {open, setOpen} = props;
    const [frameworks, setFrameworks] = React.useState([]);
    const [domains, setDomains] = React.useState([]);
    const [selectedTags, setSelectedTags] = React.useState([]);
    const [tagOptions, setTagOptions] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [localSearchText, setLocalSearchText] = React.useState('');
    const [offset, setOffSet] = React.useState(0);
    const [models, setModels] = React.useState([]);
    const [frameworkState, setFrameWorkState] = React.useState({});
    const [domainsState, setDomainsState] = React.useState({});
    const [frameworkOpen, setFrameworkOpen] = React.useState(true);
    const [domainOpen, setDomainOpen] = React.useState(false);
    const [tagOpen, setTagOpen] = React.useState(false);
    const [total, setTotal] = React.useState(0);
    const [page, setPage] = React.useState(1);

    React.useEffect(() => {
        if (localSearchText !== '' || props.searchText) {
            setLocalSearchText(props.searchText);
            !loading && handleFetchAll()
        }
    }, [props.searchText])
    React.useEffect(async () => {
        const myInit = { // OPTIONAL
            headers: {
                Authorization: `${(await Auth.currentSession()).getIdToken().getJwtToken()}`,
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
            }, // OPTIONAL
            response: true, // OPTIONAL (return the entire Axios response object instead of only response.data)
        };
        API
            .get("inferencehubapi", `/search/tags`, myInit)
            .then(response => {
                const tagOptions = handleFormatTagOptions(response.data);
                setTagOptions(tagOptions);
            })
            .catch(error => {
                console.log(error.response);
            });
    }, [])
    React.useEffect(async () => {
        const myInit = { // OPTIONAL
            headers: {
                Authorization: `${(await Auth.currentSession()).getIdToken().getJwtToken()}`,
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
            }, // OPTIONAL
            response: true, // OPTIONAL (return the entire Axios response object instead of only response.data)
        };

        API
            .get("inferencehubapi", `/frameworks`, myInit)
            .then(response => {
                setFrameworks(response.data)
                let framworks = {};
                response.data.map((item) => {
                    framworks[item] = false;
                })
                setFrameWorkState(framworks)
            })
            .catch(error => {
                console.log(error.response);
            });
    }, [])
    React.useEffect(async () => {
        const myInit = { // OPTIONAL
            headers: {
                Authorization: `${(await Auth.currentSession()).getIdToken().getJwtToken()}`,
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
            }, // OPTIONAL
            response: true, // OPTIONAL (return the entire Axios response object instead of only response.data)
        };

        API
            .get("inferencehubapi", `/domains`, myInit)
            .then(response => {
                setDomains(response.data)
                let domains = {};
                response.data.map((item) => {
                    domains[item] = false;
                })
                setDomainsState(domains)
            })
            .catch(error => {
                console.log(error.response);
            });
    }, [])



    const handleChangeTags = (selectedTags) => {
        setSelectedTags(selectedTags)
        props.onSetSelectedTags(selectedTags)
        initState();
    }

    const handleClearTags = () => {
        setSelectedTags([])
        props.onSetSelectedTags([])
        initState();
    }
    const handleCleanSelections = () => {
        initFrameworksState(frameworks);
        initDomainState(domains)
        initState();
    }

    const handleFormatTagOptions = (items) => {
        const options = items.reduce((finalArry, currentItem) => {
            const { name } = currentItem;
            finalArry.push({
                value: name,
                label: name
            });
            return finalArry;
        }, []);
        return options;
    }
    const initFrameworksState = (data) => {
        let framworks = {};
        data.map((item) => {
            framworks[item] = false;
        })
        setFrameWorkState(framworks)
        props.onSetFrameworkState(framworks)
    }
    const initDomainState = (data) => {
        let domains = {};
        data.map((item) => {
            domains[item] = false;
        })
        props.onSetDomainState(domains)
        setDomainsState(domains)
    }
    const handleFetchAll = async () => {
        handleCleanSelections()
        setLoading(true);
        setSelectedTags([]);
    const myInit = { // OPTIONAL
        headers: {
            Authorization: `${(await Auth.currentSession()).getIdToken().getJwtToken()}`,
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
        }, // OPTIONAL
        response: true, // OPTIONAL (return the entire Axios response object instead of only response.data)
        queryStringParameters: {  // OPTIONAL
            expression: props.searchText,
            offset,
        },
    };

    API
        .get("inferencehubapi", `/search/all`, myInit)
        .then(response => {
            const { items, offset: newOffSet, total } = response.data;
            setModels(items);
            setOffSet(newOffSet);
            setTotal(Math.ceil(total / 20));
            setLoading(false)
        })
        .catch(error => {
            setLoading(false);
            console.log(error.response);
        });
}
    const handleChangeFrameWork = (event) => {
        initState();
        let tmp = {
            ...frameworkState,
            [event.target.name]: event.target.checked,
        }
        setFrameWorkState(tmp);
        props.onSetFrameworkState(tmp);
    };
    const handleChangeDomain = (event) => {
        initState();
        let tmp = {
            ...domainsState,
            [event.target.name]: event.target.checked,
        }
        setDomainsState(tmp);
        props.onSetDomainState(tmp);
    };
    const handleCollapseFramework = () => {
        setFrameworkOpen(!frameworkOpen)
    }
    const handleCollapseDomain = () => {
        setDomainOpen(!domainOpen)
    }
    const handleCollapseTag = () => {
        setTagOpen(!tagOpen)
    }

    const initState = () => {
        setModels([]);
        setOffSet(0);
        setTotal(0);
        setPage(1);
    };

    return (
            <ThemeProvider theme={mdTheme}>
                <Box sx={{ display: 'flex' }}>
                    <CssBaseline />
                    <Drawer variant="permanent" open={open} style={{ width: "100%" }}>
                        <Toolbar onClick={setOpen} style={{ cursor: "pointer" }} className="filter">
                            {open ?
                            <>
                            <FilterList />
                            <div style={{ fontSize: 18, fontWeight: "bold", marginLeft: 10 }}>
                                Filter
                            </div>  
                            <IconButton 
                            sx={{
                                marginLeft: 12,
                                px: [1],
                            }} 
                            >
                                <ArrowBack />
                            </IconButton>
                            </>
                            :
                            <><ArrowForwardIcon/></>
                        }
                        </Toolbar>
                        <Divider />
                        {open &&
                        <>
                        <FormControl className="framework ">
                            <div className="d-flex flex-row">
                                <FormLabel style={{ fontSize: 18, marginTop: 10, color:"black", fontWeight: "bold", marginLeft: 27, cursor: "pointer" }} component="legend" onClick={handleCollapseFramework} >Framework</FormLabel>
                                {frameworkOpen  ? 
                                    <IconButton onClick={handleCollapseFramework} className="arrow-btn mb-2">
                                        <ExpandLessIcon/>
                                    </IconButton>
                                        :  
                                    <IconButton onClick={handleCollapseFramework} className="arrow-btn mb-2">
                                        <ExpandMoreIcon/>
                                    </IconButton> }
                            </div>
                            <FormGroup style={{ marginLeft: 25 }}>
                                {frameworkOpen && frameworks && frameworks.length !== 0 && frameworks.map((item, index) => {
                                    return (
                                        <FormControlLabel
                                            control={
                                                <Checkbox checked={frameworkState[item] || false} onChange={(e) => handleChangeFrameWork(e)} name={item} size="small" />
                                            }
                                            label={item}
                                            key={`framework-check-${index}`}
                                        />
                                    )
                                })}
                            </FormGroup>
                        </FormControl>
                        <Divider/>
                        <FormControl  className="domainForm">
                            <div className="d-flex flex-row">
                                <FormLabel style={{ fontSize: 18, marginTop:10, color:'black', fontWeight: "bold", marginLeft: 27, cursor: "pointer" }} component="legend" onClick={handleCollapseDomain}>Domain</FormLabel>
                                {domainOpen  ? 
                                    <IconButton onClick={handleCollapseDomain} className="arrow-btn mb-2">
                                        <ExpandLessIcon/>
                                    </IconButton>
                                        :  
                                    <IconButton onClick={handleCollapseDomain} className="arrow-btn mb-2">
                                        <ExpandMoreIcon/>
                                    </IconButton> }
                            </div>
                            <FormGroup style={{ marginLeft: 25 }}>
                                {domainOpen && domains && domains.length !== 0 && domains.map((item, index) => {
                                    return (
                                        <FormControlLabel
                                            control={
                                                <Checkbox checked={domainsState[item] || false} onChange={handleChangeDomain} name={item} size="small" />
                                            }
                                            label={item}
                                            key={`domain-check-${index}`}
                                        />
                                    )
                                })}
                            </FormGroup>
                        </FormControl>
                        <Divider/>
                        <FormControl className="filterClear">
                            {tagOpen ? 
                            <div>
                                <div className="d-flex flex-row">
                                    <FormLabel component="legend"  style={{ fontSize: 18, marginTop:10, color:'black', fontWeight: "bold", marginLeft: 27, cursor: "pointer" }}  onClick={handleCollapseTag}>Tag</FormLabel>
                                    <IconButton onClick={handleCollapseTag} className="arrow-btn mb-2">
                                        <ExpandLessIcon/>
                                    </IconButton>
                                </div>
                                <a className="clearTags" style={{ marginLeft: 20 }} onClick={handleClearTags}>Clear tags</a>
                                <Select
                                    style={{marginBottom: 20, width: "100%", height: "auto", cursor: "pointer" }}
                                    isMulti
                                    value={selectedTags}
                                    name="colors"
                                    options={tagOptions}
                                    className="select"
                                    classNamePrefix="select"
                                    onChange={handleChangeTags}
                                    instanceId  = "select_tags"
                                />
                            </div>
                            : 
                            <div className="d-flex flex-row">
                                <FormLabel component="legend" style={{ fontSize: 18, marginTop:10, color:'black', fontWeight: "bold", marginLeft: 27, cursor: "pointer" }}   onClick={handleCollapseTag}>Tag</FormLabel>
                                <IconButton onClick={handleCollapseTag} className="arrow-btn mb-2">
                                    <ExpandMoreIcon/>
                                </IconButton>
                            </div>
                            }   
                        </FormControl>
                        <Divider />
                        <Toolbar className="clearSection" style={{ cursor: "pointer", }}>
                            <div style={{ fontSize: 18, fontWeight: "bold", }} onClick={handleCleanSelections}>Clear Selection</div>
                        </Toolbar>
                        <Divider/>
                    </>
                    }
                    </Drawer>
                </Box>
            </ThemeProvider>       
    )
}

const mapStateToProps = createStructuredSelector({
    searchText: makeSelectSearchText(),
});
function mapDispatchToProps(dispatch) {
    return {
        onSetSearchText: (searchText) => dispatch(setSearchText(searchText)),
        onSetActiveModel: (model) => dispatch(setActiveModel(model)),
        onSetFrameworkState: (state) => dispatch(setFrameworkState(state)),
        onSetDomainState: (state) => dispatch(setDomainState(state)),
        onSetSelectedTags: (tags) => dispatch(setSelectedTags(tags)),
    };
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);
export default compose(withConnect)(SideNavBar);
