import React from 'react';
import Router from "next/router";
import axios from 'axios';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Layout from '../components/Layout';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Dropzone from 'react-dropzone'
import { Auth, API } from 'aws-amplify';
import Amplify from '@aws-amplify/core';
import awsconfig from '../aws-export';
Amplify.configure(awsconfig);

const CreateModelPage = (props) => {
    const [name, setName] = React.useState('');
    const [domain, setDomain] = React.useState('');
    const [framework, setFramework] = React.useState('');
    const [git, setGit] = React.useState('');
    const [tags, setTags] = React.useState('');
    const [train, setTrain] = React.useState('');
    const [gpu, setGpu] = React.useState(false);
    const [reference, setReference] = React.useState('');
    const [colab, setColab] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [domainList, setDomainList] = React.useState([]);
    const [frameworkList, setFrameworkList] = React.useState([]);
    const [isDisable, setIsDisable] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [formErrors, setFormErrors] = React.useState({});
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [message, setMessage] = React.useState('');
    const [showSuccess, setShowSuccess] = React.useState(false);
    const [showError, setShowError] = React.useState(false);

    const [selectedFiles, setSelectedFiles] = React.useState(null);
    const [currentFile, setCurrentFile] = React.useState(null);
    const [progress, setProgress] = React.useState(0);
    const [uploadUrl, setUploadUrl] = React.useState('');
    const steps = ['Get the uploading url', 'Upload the model'];
    const [activeStep, setActiveStep] = React.useState(0);

    const IOSSwitch = styled((props) => (
        <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
    ))(({ theme }) => ({
        width: 42,
        height: 26,
        padding: 0,
        '& .MuiSwitch-switchBase': {
            padding: 0,
            margin: 2,
            transitionDuration: '300ms',
            '&.Mui-checked': {
                transform: 'translateX(16px)',
                color: '#fff',
                '& + .MuiSwitch-track': {
                    backgroundColor: theme.palette.mode === 'dark' ? '#2ECA45' : '#65C466',
                    opacity: 1,
                    border: 0,
                },
                '&.Mui-disabled + .MuiSwitch-track': {
                    opacity: 0.5,
                },
            },
            '&.Mui-focusVisible .MuiSwitch-thumb': {
                color: '#33cf4d',
                border: '6px solid #fff',
            },
            '&.Mui-disabled .MuiSwitch-thumb': {
                color:
                    theme.palette.mode === 'light'
                        ? theme.palette.grey[100]
                        : theme.palette.grey[600],
            },
            '&.Mui-disabled + .MuiSwitch-track': {
                opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
            },
        },
        '& .MuiSwitch-thumb': {
            boxSizing: 'border-box',
            width: 22,
            height: 22,
        },
        '& .MuiSwitch-track': {
            borderRadius: 26 / 2,
            backgroundColor: theme.palette.mode === 'light' ? '#E9E9EA' : '#39393D',
            opacity: 1,
            transition: theme.transitions.create(['background-color'], {
                duration: 500,
            }),
        },
    }));
    React.useEffect(() => {
        if (domainList && domainList.length === 0) {
            onFetchDomains();
        }
    }, [])
    React.useEffect(() => {
        if (frameworkList && frameworkList.length === 0) {
            onFetchFramworkList();
        }
    }, [])
    React.useEffect(() => {
        if (Object.keys(formErrors).length === 0 && isSubmitting) {
            onSubmitForm();
        }
    }, [formErrors]);

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
        setProgress(0);
        setCurrentFile(null);
    };

    const onDrop = (files) => {
        if (files.length > 0) {
            setSelectedFiles(files)
        }
    }
    const handleSwitch = (event) => {
        setGpu(event.target.checked);
    };
    const handleChangeValue = (e, target) => {
        e.preventDefault();
        switch (target) {
            case 'name':
                setName(e.target.value);
                break;
            case 'domain':
                setDomain(e.target.value);
                break;
            case 'framework':
                setFramework(e.target.value);
                break;
            case 'git':
                setGit(e.target.value);
                break;
            case 'tags':
                setTags(e.target.value);
                break;
            case 'train':
                setTrain(e.target.value);
                break;
            case 'gpu':
                setGpu(e.target.value);
                break;
            case 'reference':
                setReference(e.target.value);
                break;
            case 'colab':
                setColab(e.target.value);
                break;
            case 'description':
                setDescription(e.target.value);
                break;
            default:
                break;
        }
    }
    const onFetchFramworkList = async () => {
        const myInit = { // OPTIONAL
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
                Authorization: `${(await Auth.currentSession()).getIdToken().getJwtToken()}`
            }, // OPTIONAL
            response: true, // OPTIONAL (return the entire Axios response object instead of only response.data)
        };

        API
            .get("inferencehubapi", `/frameworks`, myInit)
            .then(response => {
                setFrameworkList(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.log(error.response);
            });
    }
    const onFetchDomains = async () => {
        const myInit = { // OPTIONAL
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
                Authorization: `${(await Auth.currentSession()).getIdToken().getJwtToken()}`
            }, // OPTIONAL
            response: true, // OPTIONAL (return the entire Axios response object instead of only response.data)
        };

        API
            .get("inferencehubapi", `/domains`, myInit)
            .then(response => {
                setDomainList(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.log(error.response);
            });
    }
    const handleValidationFields = () => {
        let errors = {};
        if (name === '') {
            errors.name = "Cannot be blank";
        }
        if (domain === '') {
            errors.domain = "Cannot be blank";
        }
        if (framework === '') {
            errors.framework = "Cannot be blank";
        }
        if (git === '') {
            errors.git = "Cannot be blank";
        } else {
            let expression = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
            let regex = new RegExp(expression);
            if (!git.match(regex)) {
                errors.git = "Invalid format";
            }
        }
        if (tags === '') {
            errors.tags = "Cannot be blank";
        } else {
            let expression = /(([a-z]+_)+$)|(([a-z]+_[a-z]+)+$)|([a-z]+$|([0-9]+$))/;
            let regex = new RegExp(expression);
            if (!tags.match(regex)) {
                errors.tags = "Invalid format";
            }
        }
        return errors;
    }
    const onSubmitForm = async () => {
        setIsDisable(true)
        const myInit = { // OPTIONAL
            headers: {
                Authorization: `${(await Auth.currentSession()).getIdToken().getJwtToken()}`
            }, // OPTIONAL
            body: {
                "domain": domain,
                "name": name,
                "framework": framework,
                "github_url": git,
                "gpu": gpu,
                "tags": tags.split(','),
            },
            response: true, // OPTIONAL (return the entire Axios response object instead of only response.data)
            queryStringParameters: {  // OPTIONAL
            },
        };

        API
            .post("inferencehubapi", `/model`, myInit)
            .then(response => {
                setIsDisable(false);
                const { status, statusText } = response;
                if (status === 200) {
                    handleGetUploadUrl();
                }
            })
            .catch(error => {
                setIsDisable(false);
                const { statusText, data: { detail } } = error.response;
                setMessage(detail)
                setShowError(true);
            });
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        setShowError(false);
        setShowSuccess(false);
        setFormErrors(handleValidationFields());
        setIsSubmitting(true);
    }
    const renderCreateModalForm = () => {
        return (
            <>
                <div className="header">
                    <h1>Create Model</h1>
                </div>

                <div className="create-model-content">
                    <div className="col">
                        <h3>Required Fields</h3>
                        <TextField
                            id="standard-helperText"
                            label="Name"
                            placeholder="StyleGAN2-Jorge-Super-Model"
                            variant="filled"
                            className="text-field"
                            onChange={(e) => handleChangeValue(e, 'name')}
                            error={!!formErrors.name}
                            helperText={formErrors.name}
                            value={name}
                        />
                        <FormControl variant="filled" className="text-field" error={!!formErrors.domain}>
                            <InputLabel id="domain-select-filled-label">Domain</InputLabel>
                            <Select
                                labelId="domain-select-filled-label"
                                id="domain-select-filled"
                                value={domain}
                                onChange={(e) => handleChangeValue(e, 'domain')}
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                                {domainList && domainList.length !== 0 && domainList.map((item, index) => {
                                    return (
                                        <MenuItem value={item} key={`domain-item-${index}`}>{item}</MenuItem>
                                    )
                                })}
                            </Select>
                            <FormHelperText>{formErrors.domain}</FormHelperText>
                        </FormControl>
                        <FormControl variant="filled" className="text-field" error={!!formErrors.framework}>
                            <InputLabel id="framework-select-filled-label">Framework</InputLabel>
                            <Select
                                labelId="framework-select-filled-label"
                                id="framework-select-filled"
                                value={framework}
                                onChange={(e) => handleChangeValue(e, 'framework')}
                            >
                                {
                                    frameworkList && frameworkList.length !== 0 && frameworkList.map((item, index) => {
                                        return (
                                            <MenuItem value={item} key={`framework-item-${index}`}>{item}</MenuItem>
                                        )
                                    })
                                }
                            </Select>
                            <FormHelperText>{formErrors.framework}</FormHelperText>
                        </FormControl>
                        <TextField
                            id="standard-helperText"
                            label="GitHub URL"
                            placeholder="Search tags"
                            variant="filled"
                            className="text-field"
                            onChange={(e) => handleChangeValue(e, 'git')}
                            error={!!formErrors.git}
                            helperText={formErrors.git}
                            value={git}
                        />
                        <TextField
                            id="standard-helperText"
                            label="Tags"
                            placeholder="Search tags"
                            variant="filled"
                            className="text-field"
                            onChange={(e) => handleChangeValue(e, 'tags')}
                            error={!!formErrors.tags}
                            helperText={formErrors.tags}
                            value={tags}
                        />
                    </div>
                    <div className="col">
                        <h3>Optional Fields</h3>
                        <TextField
                            id="standard-helperText"
                            label="Training data URL"
                            placeholder="https://website.com/training_data"
                            variant="filled"
                            className="text-field"
                            onChange={(e) => handleChangeValue(e, 'train')}
                            value={train}
                        />
                        <FormControlLabel
                            control={<IOSSwitch sx={{ m: 1 }} checked={gpu}
                                onChange={handleSwitch}
                                inputProps={{ 'aria-label': 'controlled' }} />}
                            label="GPU"
                            className="text-field"
                        />
                        <TextField
                            id="standard-helperText"
                            label="References"
                            placeholder="https://arxiv.org/abs/1505.04597"
                            variant="filled"
                            className="text-field"
                            onChange={(e) => handleChangeValue(e, 'reference')}
                            value={reference}
                        />
                        <TextField
                            id="standard-helperText"
                            label="Colab URL"
                            placeholder="https://website.com/colab"
                            variant="filled"
                            className="text-field"
                            onChange={(e) => handleChangeValue(e, 'colab')}
                            value={colab}
                        />
                        <TextField
                            id="standard-helperText"
                            label="Description"
                            placeholder="Add description..."
                            variant="filled"
                            multiline={true}
                            minRows="2"
                            className="text-field-large"
                            inputProps={{ maxLength: 300 }}
                            onChange={(e) => handleChangeValue(e, 'description')}
                            value={description}
                        />
                    </div>
                </div>
                <div className="submit-btn">
                    <Button variant="contained" onClick={(e) => handleSubmit(e)} disabled={isDisable}>Create Model</Button>
                </div>
                <Stack sx={{ zIndex: 1999, marginTop: 2, marginLeft: 1 }} spacing={2}>
                    {showError && <Alert variant="filled" severity="error" style={{ width: '50%',margin:'auto' }} onClose={() => { setShowError(false); setMessage('') }}>{message}</Alert>}
                    {showSuccess && <Alert variant="filled" style={{ width: '50%',margin:'auto' }} onClose={() => {
                        setShowSuccess(false);
                        setMessage('');
                    }
                    }>The new model has been created successfully.</Alert>}
                </Stack>
            </>
        )
    }
    const handleGetUploadUrl = async () => {
        const myInit = { // OPTIONAL
            headers: {
                Authorization: `${(await Auth.currentSession()).getIdToken().getJwtToken()}`
            }, // OPTIONAL
            response: true, // OPTIONAL (return the entire Axios response object instead of only response.data)
        };

        API
            .get("inferencehubapi", `/model/${domain}/${name}/get-upload-url`, myInit)
            .then(response => {
                const { data, status, statusText } = response;
                const url = data;
                setUploadUrl(url);
                if (showSuccess) {
                    setShowSuccess(false);
                    setMessage('')
                }
                setTimeout(() => {
                    handleNext();
                }, 500);
            })
            .catch(error => {
            });
    }
    const uploadService = (file, onUploadProgress) => {
        let formData = new FormData();

        formData.append('file', file);
        const http = axios.create({
            baseURL: uploadUrl,
            headers: {
                'Content-type': 'application/json',
            },
        });
        return http.put('', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress,
        });
    }
    const uploadModel = () => {
        if (uploadUrl !== '') {
            const activeFile = selectedFiles[0];
            setProgress(0);
            setCurrentFile(activeFile);
            uploadService(activeFile, (event) => {
                setProgress(Math.round((100 * event.loaded) / event.total));
            })
                .then((response) => {
                    const { status, statusText } = response;
                    if (status === 200) {
                        setMessage(statusText)
                        setShowSuccess(true);
                        setTimeout(() => {
                            Router.push("/payments");
                        }, 15000);
                    }
                })
                .catch(error => {
                    setMessage('Sorry,failed to upload the model.')
                    setShowError(true);
                    setProgress(0);
                    setCurrentFile(null);
                });
            setSelectedFiles(null);
        } else {
            setMessage('Invalid upload url...')
            setShowError(true);
        }
    }
    const renderUploadForm = () => {
        return (
            <div className="header">
                <h1>Upload Weights</h1>
                {currentFile && (
                    <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress variant="determinate" value={progress} />
                    </Box>
                )}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Dropzone onDrop={onDrop} multiple={false}>
                        {({ getRootProps, getInputProps }) => (
                            <section>
                                <div {...getRootProps({ className: 'dropzone' })}>
                                    <input {...getInputProps()} />
                                    {selectedFiles && selectedFiles[0].name ? (
                                        <div className="selected-file">
                                            {selectedFiles && selectedFiles[0].name}
                                        </div>
                                    ) : (
                                        'Drag and drop file here, or click to select file'
                                    )}
                                </div>
                                <Button variant="contained" onClick={() => uploadModel()} disabled={!selectedFiles}>Upload</Button>
                            </section>
                        )}
                    </Dropzone>
                </div>
                <Stack sx={{ zIndex: 1999, marginTop: 2, marginLeft: 1 }} spacing={2}>
                    {showError && <Alert variant="filled" severity="error" style={{ width: '50%',margin:'auto' }} onClose={() => { setShowError(false); setMessage(''); }}>{message}</Alert>}
                    {showSuccess && <Alert variant="filled" style={{ width: '50%',margin:'auto' }} onClose={() => {
                         Router.push("/payments");
                    }
                    }>Upload was successful! The content is being validated right now, you will be notified once the validation process is complete.</Alert>}
                </Stack>
            </div>
        )
    }
    const handleShowActiveStep = (activeStep) => {
        switch (activeStep) {
            case 0:
                return renderCreateModalForm();
            case 1:
                return renderUploadForm();
            default:
                return renderCreateModalForm();
        }
    }
    const renderContent = () => {
        return (
            <Box sx={{ flexGrow: 1 }} className="create-model-wrapper">
                <Stepper activeStep={activeStep}>
                    {steps.map((label, index) => {
                        const stepProps = {};
                        const labelProps = {};
                        return (
                            <Step key={label} {...stepProps}>
                                <StepLabel {...labelProps}>{label}</StepLabel>
                            </Step>
                        );
                    })}
                </Stepper>
                {activeStep === steps.length ? (
                    <React.Fragment>
                        <Typography sx={{ mt: 2, mb: 1 }}>
                            All steps completed - you&apos;re finished
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                            <Box sx={{ flex: '1 1 auto' }} />
                            <Button onClick={handleReset}>Reset</Button>
                        </Box>
                    </React.Fragment>
                ) : (
                    <React.Fragment>
                        {handleShowActiveStep(activeStep)}
                    </React.Fragment>
                )}
            </Box>
        )
    }
    return (
        <Layout {...props}>
            {loading ? <Grid item xs={12} style={{
                marginTop: 42,
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <CircularProgress />
            </Grid> : renderContent()
            }
        </Layout>
    )
}
export default CreateModelPage;
