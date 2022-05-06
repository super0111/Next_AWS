import * as React from 'react';
import Router from "next/router";
import Image from 'next/image'
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';
// import Select from 'react-select';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Layout from '../components/Layout';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import 'mdbreact/dist/css/mdb.css';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Select from '@material-ui/core/Select';
import grey from '@material-ui/core/colors/grey';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import { makeSelectDomainState, makeSelectFrameworkState, makeSelectSearchText, makeSelectSelectedTags } from '../containers/selectors';
import { setSearchText, setActiveModel } from '../containers/actions';
import { Auth, Hub, API } from 'aws-amplify';
import Amplify from '@aws-amplify/core';
import awsconfig from '../aws-export';
import PersonIcon from '@material-ui/icons/Person';
Amplify.configure(awsconfig);

const Models = (props) => {

    const [loading, setLoading] = React.useState(false);
    const [localSearchText, setLocalSearchText] = React.useState('');
    const [offset, setOffSet] = React.useState(0);
    const [total, setTotal] = React.useState(0);
    const [page, setPage] = React.useState(1);
    const [models, setModels] = React.useState([]);
    const [sort, setSort] = React.useState('');
    const [selectedTags, setSelectedTags] = React.useState([]);
    const [tagOptions, setTagOptions] = React.useState([]);
    const [frameworks, setFrameworks] = React.useState([]);
    const [domains, setDomains] = React.useState([]);

    React.useEffect(() => {
        !loading && handleFetchModels();
        console.log(props)
    }, [offset, props.selectedTags, props.frameworkState, props.domainsState])
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
                // let framworks = {};
                // response.data.map((item) => {
                //     framworks[item] = false;
                // })
                // setFrameWorkState(framworks)
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
    // const initFrameworksState = (data) => {
    //     let framworks = {};
    //     data.map((item) => {
    //         framworks[item] = false;
    //     })
    //     setFrameWorkState(framworks)npm rn
    // }
    // const initDomainState = (data) => {
    //     let domains = {};
    //     data.map((item) => {
    //         domains[item] = false;
    //     })
    //     setDomainsState(domains)
    // }
    const handleFetchAll = async () => {
        // handleCleanSelections()
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

    const handleShowDetailPage = (e, model) => {
        props.onSetActiveModel(model);
        const { domain, name } = model;
        Router.push("/model/[domainName]/[name]", `/model/${domain}/${name}`);
    }

    const CustomCard = ({ item }) => {

        return (
            <TableBody>
                <TableCell>
            <h5>{item.name}</h5>
            </TableCell>
            <TableCell>
            <p>{item.header}</p>
            </TableCell>
                <TableCell>
                    <div className="d-flex flex-row">
                        {/* <Image className="mb-1 mr-1" src="/user.png" alt="me" width="30" height="30" /> */}
                        <PersonIcon style={{ fontSize: '25px', color:"rgb(27, 27, 29)", marginTop: -4 }}/>
                        <span>{item.user}</span>
                    </div>
                </TableCell>
                <TableCell className="">
                    <div className="d-flex flex-row">
                        <div style={{ fontSize: 18, marginRight: 5 }}  className="mt-1">{item.views}</div>
                        <Image className="" src="/visible.png" alt="me" width="30" height="30" />
                    </div>
                </TableCell>     
                <TableCell>
                    <div className="d-flex flex-row">
                        <div style={{ fontSize: 18, marginTop: 11, marginRight: 5 }}>{item.likes}</div>
                        <Image src="/like.png" alt="me" width="30" height="30" />
                    </div>
                </TableCell>
                <TableCell>
                    <a href={item.github_url}>
                        <Image src="/github.png" alt="me" width="30" height="30" />
                    </a>
                </TableCell>
                <TableCell>
                    <Button className="btn btn-outline-info" size="small" onClick={(e) => handleShowDetailPage(e, item)}>Details</Button>
                </TableCell>
            </TableBody>
        )
    }
    const handleFetchModels = async () => {
        setLocalSearchText('')
        props.onSetSearchText('')
        setLoading(true);
        const tags = props.selectedTags.reduce((finalArry, currentItem) => {
            const { label, value } = currentItem;
            finalArry.push(value);
            return finalArry;
        }, [])
        console.log('props framework state', props.frameworkState)
        const frameworkKeys = Object.keys(props.frameworkState||{});
        const frameWorkFilter = frameworkKeys.reduce((finalArry, currentItem) => {
            if (props.frameworkState[currentItem]) {
                finalArry.push(currentItem)
            }
            return finalArry;
        }, [])
        const domain = Object.keys(props.domainsState||{}).reduce((finalArry, currentItem) => {
            if (props.domainsState[currentItem]) {
                finalArry.push(currentItem)
            }
            return finalArry;
        }, [])
        const myInit = { // OPTIONAL
            headers: {
                Accept: "application/json",
                Authorization: `${(await Auth.currentSession()).getIdToken().getJwtToken()}`,
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
            }, // OPTIONAL
            response: true, // OPTIONAL (return the entire Axios response object instead of only response.data)
            queryStringParameters: {  // OPTIONAL
                offset,
                tags: tags.concat(frameWorkFilter),
                domain,
            },
        };
        API
            .get("inferencehubapi", `/search/models`, myInit)
            .then(response => {
                const { items, offset: newOffSet, total } = response.data;
                setLoading(false)
                setModels(items);
                setOffSet(newOffSet);
                setTotal(Math.ceil(total / 20));
            })
            .catch(error => {
                setLoading(false);
                console.log(error.response);
            });
    }
    const handleChangePagination = (event, value) => {
        const newOffSet = (value - 1) * 20;
        setPage(value);
        setModels([]);
        setOffSet(newOffSet);
    };
    const initState = () => {
        setModels([]);
        setOffSet(0);
        setTotal(0);
        setPage(1);
    }
    const renderModels = () => {

        const columns = [
            { id: 'name', label: 'Name', minWidth: "8%", },
            { id: 'header', label: 'Header', minWidth: "8%" },
            { id: 'user', label: 'User', minWidth: "8%" },
            {
              id: 'likes',
              label: 'Likes',
              minWidth: "8%",
              align: 'right',
              format: (value) => value.toLocaleString('en-US'),
            },
            {
              id: 'views',
              label: 'Views',
              minWidth: "10%",
              align: 'right',
              format: (value) => value.toLocaleString('en-US'),
            },
            {
                id: 'githublink',
                label: 'GitHubLink',
                minWidth: "10%",
                align: 'center',
                format: (value) => value.toFixed(2),
              },
            {
              id: 'details',
              label: 'Details',
              minWidth: "10%",
              align: 'right',
              format: (value) => value.toFixed(2),
            },
         
          ];
          
          return (
            <>
                <Paper className="flex-direction" style={{  }}>
                    <Grid>
                        <div className="d-flex flex-row mt-3 justify-content-between">
                            <div className="d-flex flex-row" style={{ textAlign: "left", marginLeft: 25, marginTop: 35 }}>
                                <p style={{ fontSize: 18 }}>{models.length}</p>
                                <span style={{ marginLeft: 5, marginTop: 2 }}>Results</span>
                            </div>
                            <Box className="mt-3" sx={{ minWidth: 120, marginRight: 3 }}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label" className="mb-2">Sort By</InputLabel>
                                    <Select
                                        style={{ marginTop: 10, marginRight: 20 }}
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={sort}
                                        label="Sort By"
                                    >
                                    <MenuItem value={10}>Views</MenuItem>
                                    <MenuItem value={20}>Likes</MenuItem>
                                    <MenuItem value={30}>Date</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        </div>
                    </Grid>
                    <Divider style={{ fontSize: 20,  }}/>
                    <TableContainer className="d-flex justify-content-center" >
                        <Table style={{ textAlign: "center" }}>
                            <TableHead>
                                <TableRow>
                                {columns.map((column) => (
                                    <TableCell
                                    key={column.id}
                                    // align={column.align}
                                    style={{ minWidth: column.minWidth, fontSize: 20 }}
                                    >
                                    {column.label}
                                    </TableCell>
                                ))}
                                </TableRow>
                            </TableHead>
                            {
                                models.map((item, index) => {
                                    return (
                                        <CustomCard key={index} className="tableCell" item={item} />
                                    )
                                })
                            }
                        </Table>
                    </TableContainer>
                </Paper>
                <div className="pagination">
                    <Stack spacing={2}>
                        <Pagination showFirstButton showLastButton count={total} page={page} onChange={handleChangePagination} />
                    </Stack>
                </div>
            </>
        )
    }
    // const handleClearTags = () => {
    //     setSelectedTags([])
    //     initState();
    // }
    // const handleCleanSelections = () => {
    //     // initFrameworksState(frameworks);
    //     // initDomainState(domains)
    //     initState();
    // }


    const handleChange = (event) => {
      setSort(event.target.value);
    };
    return (
        <Layout {...props}>
            <Box xs={{ flexGrow: 1 }} style={{ marginLeft: 25 }}>
                <Grid
                    style={{ flexDirection: "column" }}
                    container
                    direction="row"
                    justifyContent="space-between"
                    columns={16}
                    spacing={4}
                    className="model-wrapper"
                >
                    
                        {
                        models && models.length !== 0 ?
                            renderModels() : loading ?
                                <Grid item xs={12} style={{
                                    textAlign: 'center',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <CircularProgress />
                                </Grid> : <Grid item xs={12} style={{
                                    textAlign: 'center',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <h3 className="d-flex justify-content-center">Sorry, there is no models to show.</h3>
                                </Grid>
                    }
                </Grid>
            </Box>
        </Layout>
    )
}

const mapStateToProps = createStructuredSelector({
    searchText: makeSelectSearchText(),
    frameworkState: makeSelectFrameworkState(),
    domainState: makeSelectDomainState(),
    selectedTags: makeSelectSelectedTags(),
});
function mapDispatchToProps(dispatch) {
    return {
        onSetSearchText: (searchText) => dispatch(setSearchText(searchText)),
        onSetActiveModel: (model) => dispatch(setActiveModel(model))
    };
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);
export default compose(withConnect)(Models);
