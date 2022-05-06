import * as React from 'react';
import Router from "next/router";
import Image from 'next/image'

import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';
import Select from 'react-select';

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

import { makeSelectSearchText } from '../containers/selectors';
import { setSearchText, setActiveModel } from '../containers/actions';
import { Auth, Hub, API } from 'aws-amplify';
import Amplify from '@aws-amplify/core';
import awsconfig from '../aws-export';
Amplify.configure(awsconfig);

const Models = (props) => {

    const [loading, setLoading] = React.useState(false);
    const [localSearchText, setLocalSearchText] = React.useState('');
    const [offset, setOffSet] = React.useState(0);
    const [total, setTotal] = React.useState(0);
    const [page, setPage] = React.useState(1);
    const [models, setModels] = React.useState([]);

    const [frameworkState, setFrameWorkState] = React.useState({});
    const [domainsState, setDomainsState] = React.useState({});
    const [selectedTags, setSelectedTags] = React.useState([]);
    const [tagOptions, setTagOptions] = React.useState([]);

    const [frameworks, setFrameworks] = React.useState([]);
    const [domains, setDomains] = React.useState([]);

    React.useEffect(() => {
        !loading && handleFetchModels();
    }, [offset, selectedTags, frameworkState, domainsState])
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
                console.log('frameworks:', response)
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
                console.log('domains:', response)
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
    const initFrameworksState = (data) => {
        let framworks = {};
        data.map((item) => {
            framworks[item] = false;
        })
        setFrameWorkState(framworks)
    }
    const initDomainState = (data) => {
        let domains = {};
        data.map((item) => {
            domains[item] = false;
        })
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
            .get("inferencehubapi", `/user/models`, myInit)
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
            <Card >
                <CardContent>
                    <div className="model-card fixed">
                        <div className="content">
                            <h5>{item.name}</h5>
                            <p>{item.description}</p>
                        </div>
                        <div className="voted">
                            <div className="info">
                                <span>{item.user}</span>
                                <Image src="/user.png" alt="me" width="64" height="64" />
                            </div>
                            <div className="info">
                                {item.views}
                                <Image src="/visible.png" alt="me" width="64" height="64" />

                            </div>
                            <div className="info">
                                {item.likes}
                                <Image src="/like.png" alt="me" width="64" height="64" />
                            </div>
                            <div className="info">
                                <a href={item.github_url}>
                                    <Image src="/github.png" alt="me" width="64" height="64" />
                                </a>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardActions style={{ justifyContent: 'flex-end' }}>
                    <Button size="small" onClick={(e) => handleShowDetailPage(e, item)}>Details</Button>
                </CardActions>
            </Card>
        )
    }
    const handleFetchModels = async () => {
        setLocalSearchText('')
        props.onSetSearchText('')
        setLoading(true);
        const tags = selectedTags.reduce((finalArry, currentItem) => {
            const { label, value } = currentItem;
            finalArry.push(value);
            return finalArry;
        }, [])
        const frameworkKeys = Object.keys(frameworkState);
        const frameWorkFilter = frameworkKeys.reduce((finalArry, currentItem) => {
            if (frameworkState[currentItem]) {
                finalArry.push(currentItem)
            }
            return finalArry;
        }, [])
        const domain = Object.keys(domainsState).reduce((finalArry, currentItem) => {
            if (domainsState[currentItem]) {
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
            .get("inferencehubapi", `/user/models`, myInit)
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
    const handleChangeFrameWork = (event) => {
        initState();
        setFrameWorkState({
            ...frameworkState,
            [event.target.name]: event.target.checked,
        });
    };
    const handleChangeDomain = (event) => {
        initState();
        setDomainsState({
            ...domainsState,
            [event.target.name]: event.target.checked,
        });
    };
    const handleChangePagination = (event, value) => {
        const newOffSet = (value - 1) * 20;
        setPage(value);
        setModels([]);
        setOffSet(newOffSet);
    };
    const handleChangeTags = (selectedTags) => {
        setSelectedTags(selectedTags)
        initState();
    }
    const initState = () => {
        setModels([]);
        setOffSet(0);
        setTotal(0);
        setPage(1);
    }
    const renderModels = () => {
        return (
            <Grid item xs={14}>
                <Grid container spacing={1}>
                    {
                        models.map((item, index) => {
                            return (
                                <Grid item xs={4} key={`model-card-${index}`}>
                                    <CustomCard item={item} />
                                </Grid>
                            )
                        })
                    }
                </Grid>
                <div className="pagination">
                    <Stack spacing={2}>
                        <Pagination showFirstButton showLastButton count={total} page={page} onChange={handleChangePagination} />
                    </Stack>
                </div>
            </Grid>
        )
    }
    const handleClearTags = () => {
        setSelectedTags([])
        initState();
    }
    const handleCleanSelections = () => {
        initFrameworksState(frameworks);
        initDomainState(domains)
        initState();
    }
    return (
        <Layout {...props}>
            <Box xs={{ flexGrow: 1 }} style={{ padding: 20 }}>
                <Grid
                    container
                    direction="row"
                    justifyContent="space-between"
                    columns={16}
                    spacing={4}
                    className="model-wrapper"
                >
                    <Grid item xs={16}>
                        <div className="filter-header">
                            <h5>Filters</h5>
                            <a onClick={handleCleanSelections}>Clear selection</a>
                        </div>
                    </Grid>
                    <Grid item xs={2}>
                        <div className="filter-section">
                            <FormControl xs={{ m: 3 }} component="fieldset" variant="standard" style={{ marginTop: 10 }}>
                                <FormLabel component="legend">FrameWork</FormLabel>
                                <FormGroup>
                                    {frameworks && frameworks.length !== 0 && frameworks.map((item, index) => {
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
                            <Divider light style={{ marginRight: 10 }} />
                            <FormControl xs={{ m: 3 }} component="fieldset" variant="standard" style={{ marginTop: 10 }}>
                                <FormLabel component="legend">Domain</FormLabel>
                                <FormGroup>
                                    {domains && domains.length !== 0 && domains.map((item, index) => {
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
                            <Divider light style={{ marginRight: 10 }} />
                            <FormControl xs={{ m: 3 }} component="fieldset" variant="standard" style={{ marginTop: 10 }}>
                                <div className="tag-filter">
                                    <h5>Tags</h5>
                                    <a onClick={handleClearTags}>Clear tags</a>
                                </div>
                                <Select
                                    isMulti
                                    value={selectedTags}
                                    name="colors"
                                    options={tagOptions}
                                    className="basic-multi-select"
                                    classNamePrefix="select"
                                    onChange={handleChangeTags}
                                />
                            </FormControl>
                        </div>
                    </Grid>
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
});
function mapDispatchToProps(dispatch) {
    return {
        onSetSearchText: (searchText) => dispatch(setSearchText(searchText)),
        onSetActiveModel: (model) => dispatch(setActiveModel(model))
    };
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);
export default compose(withConnect)(Models);
