import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';
import {
    makeSelectActiveModel
} from '../../../../containers/selectors';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import { Auth, API } from 'aws-amplify';
import Amplify from '@aws-amplify/core';
import awsconfig from '../../../../aws-export';
import Layout from '../../../../components/Layout';

import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import PersonIcon from '@material-ui/icons/Person';
import VisibilityIcon from '@material-ui/icons/Visibility';
import GitHubIcon from '@material-ui/icons/GitHub';;
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';
import TocIcon from '@material-ui/icons/Toc';
import DnsIcon from '@material-ui/icons/Dns';
import IconButton from '@mui/material/IconButton';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Select from 'react-select';
import Divider from '@mui/material/Divider';
import ReactMarkdown from 'react-markdown'
import RefreshIcon from '@material-ui/icons/Refresh';
import PageviewIcon from '@material-ui/icons/Pageview';
import ShareIcon from '@material-ui/icons/Share';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import Image from 'next/image'
import rehypeRaw from 'rehype-raw';

Amplify.configure(awsconfig);
//Returns readme with changed links
function markdownInternalLinks(markdownString, url) {
    let pattern = /(!\[.+?\])(\(.+?\))/gm;
    let internalPattern = /(\(.+?\))/g;
    let matches = markdownString.match(pattern);
    let replaceArray = Array(matches.length);
  
    for (var i = 0; i < matches.length; i++){
      let value = matches[i].match(internalPattern);
      value = value[0].substring(1,value[0].length-1);
      replaceArray[i] = "![Image]" + "(https://raw.githubusercontent.com" + url+  "/"+ value + ")";
  
      markdownString = markdownString.replace(matches[i],replaceArray[i]);
    }
    return markdownString;
  }
  
  function markdownHtmlLink(str, url) {
      let pattern = /(<img src=")(.+?)(">)/gm;
      let lines = str.split("/n")
      let result = ""
  
      for (var j = 0; j < lines.length; j++) {
          let matches = [...lines[j].matchAll(pattern)];
          for (var i = 0; i < matches.length; i++){
              let replaceStr = "https://raw.githubusercontent.com" + url+  "/"+ matches[i][2];
              let match = matches[i][2]
              lines[j] = lines[j].replaceAll(match, replaceStr);
          }
          result += lines[j]
      }
  
      return result;
  }
 

const ModelPage = (props) => {

    const [markdown, setMarkdown] = React.useState([]);
    const [priceOpen, setPriceOpen] = React.useState(false);
    const [listingsOpen, setListingsOpen] = React.useState(false);
    const [offerOpen, setOfferOpen] = React.useState(false);
    const handleCollapsePrice = () => {
        setPriceOpen(!priceOpen)
    }
    const handleCollapseListings = () => {
        setListingsOpen(!listingsOpen)
    }
    const handleCollapseOffer = () => {
        setOfferOpen(!offerOpen)
    }
    const options = [
        { value: 'Last 7 Days', label: 'Last 7 Days' },
        { value: 'Last 3 Days', label: 'Last 3 Days' },
        { value: 'Last 1 Days', label: 'Last 1 Days' }
      ]
    React.useEffect(async () => {
        if (props.activeModel) {
            const myInit = { // OPTIONAL
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json",
                    Authorization: `${(await Auth.currentSession()).getIdToken().getJwtToken()}`
                }, // OPTIONAL
                response: true, // OPTIONAL (return the entire Axios response object instead of only response.data)
                queryStringParameters: {  // OPTIONAL
                },
            };
            const { domain, name: model_name } = props.activeModel;
            API
                .get("inferencehubapi", `/model/${domain}/${model_name}`, myInit)
                .then(response => {
                })
                .catch(error => {
                    console.log(error.response);
                });
            let o_url = props.activeModel.github_url
            const url = o_url.slice(18, o_url.length) +"/master/README.md"

            API
                .get("github", url)
                .then(response => {
                    let correctMarkdown = markdownInternalLinks(response, o_url.slice(18, o_url.length) +"/master")
                    let correctHtml = markdownHtmlLink(correctMarkdown, o_url.slice(18, o_url.length)+ "/master")
                    setMarkdown(correctHtml)
                })
                .catch(error => {
                    console.log("Could not retrieve data from Github")
                    console.log(error.response);
                });
        }
    }, [props.activeModel])


    // skipHtml ignores all html contents in the Markdown file
    // alternative: use rehype-raw to render mixtures of html and markdown
    // -> Can be dangerous and should only be done when the markdown file can be trusted
    return (
        props.activeModel ? 
        
        <Layout {...props}>
            <div className="d-flex flex-column justify-content-around align-items-center">
                <div className="d-flex flex-row model-view">
                    <Box className="description-box"
                        component="form"
                        noValidate
                        autoComplete="off"
                        style={{ width:"58%" }}
                    >
                        <div className="d-flex flex-row justify-content-between">
                            <div className="description-title">Description</div>
                            <div className="d-flex flex-row description-like">
                                {/* <img src="/like.png" alt="like-Image" /> */}
                                <FavoriteBorderIcon/>
                                <p className="like-text">{props.activeModel.likes}</p>
                            </div>
                        </div>
                        <div className = "model-detail-card" style={{ border: "1px solid rgb(229, 232, 235)", borderRadius: 10, }} >
                            <CardContent>
                                <div className="model-card">
                                    <div className="content">
                                        <p style={{ fontSize:20, textAlign: "justify" }}>{props.activeModel.description}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </div>
                    </Box>
                    <div className="d-flex flex-column detail-body" >
                        <div className="d-flex flex-row justify-content-between">
                            <div className="detail-showMore"><a href="#">show More</a></div>
                            <div className="d-flex flex-row" style={{ }}>
                                <RefreshIcon style={{ fontSize: 45 }} className="icon-button"/>
                                <PageviewIcon style={{ fontSize: 45 }} className="icon-button"/>
                                <ShareIcon style={{ fontSize: 45 }} className="icon-button"/>
                                <MoreVertIcon style={{ fontSize: 45 }} className="icon-button"/>
                            </div>
                        </div>
                        <div className="detail-title">
                            <h5>{props.activeModel.name}</h5>
                        </div>
                        <div className="d-flex flex-column">
                            <div className="d-flex flex-row">
                                <div className="user-text"> 
                                    <div className="d-flex flex-row">
                                        <div> Owned by <span>{props.activeModel.user}</span></div>
                                        <PersonIcon style={{ fontSize: '30px', color:"rgb(27, 27, 29)" }}/>
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex flex-row justify-content-around detail-icon">
                                <div className="show-body d-flex flex-row">
                                    <VisibilityIcon className="show-icon"/>
                                    <p>{props.activeModel.views} views</p>
                                    {/* <img src="/visible.png" alt="" /> */}
                                </div>
                                <div className="d-flex flex-row like-body">
                                    {/* <img src="/like.png" alt="like-Image" /> */}
                                    <FavoriteIcon className="like-icon"/>
                                    <p className="like-text">{props.activeModel.likes} favorites</p>
                                </div>
                                <div className="git-body">
                                    <a href={props.activeModel.github_url}>
                                        {/* <img src="/github.png" alt="" /> */}
                                        <GitHubIcon className="git-icon"/>
                                    </a>
                                </div>
                            </div>
                            <div className="detail-make-btn">
                                <button className="make-btn">Make offer</button>
                            </div>
                            <div className="detail-make-btn mt-4" style={{ position: "relative" }}>
                                <div className="d-flex flex-row justify-content-between showMore" onClick={handleCollapsePrice}>
                                    <div className="d-flex flex-row" >
                                        <MonetizationOnIcon style={{ marginTop:3, fontSize: 25, marginRight:5 }}/>
                                        <p>Price History</p> 
                                    </div>
                                    <div>
                                    {priceOpen  ? 
                                        <IconButton className="arrow-btn mb-2" onClick={handleCollapsePrice}>
                                            <ExpandLessIcon/>
                                        </IconButton>
                                        :     
                                        <IconButton className="arrow-btn mb-2" onClick={handleCollapsePrice}>
                                            <ExpandMoreIcon/>
                                        </IconButton>
                                    }       
                                    </div>
                                </div>
                                <Divider/>
                                {priceOpen  && 
                                    <div className="row price-select">
                                        <div className="col-lg-5"><Select options={options} /></div>
                                        <div className="col-lg-7">
                                            <div className="row">
                                                <div className="col-lg-6">
                                                    <div className="">3 Days Avg.Price</div>
                                                    <div className=""><AttachMoneyIcon style={{ fontSize: "20px", marginBottom: "2px" }}/>0.3246</div>
                                                </div>
                                                <div className="col-lg-6">
                                                    <div className="">7 Days Avg.Price</div>
                                                    <div className=""><AttachMoneyIcon  style={{ fontSize: "20px",  marginBottom: "2px" }}/>0.1296</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                }
                            </div>
                            <div className="detail-make-btn mt-4">
                                <div className="d-flex flex-row justify-content-between showMore"  onClick={handleCollapseListings}>
                                    <div className="d-flex flex-row">
                                        <TocIcon style={{ marginTop:3, fontSize: 25, marginRight:5 }}/>
                                        <p>Listings</p> 
                                    </div>
                                    <div>
                                    {listingsOpen  ? 
                                        <IconButton className="arrow-btn mb-2" onClick={handleCollapseListings}>
                                            <ExpandLessIcon/>
                                        </IconButton>
                                                :
                                        <IconButton className="arrow-btn mb-2" onClick={handleCollapseListings}>
                                            <ExpandMoreIcon/>
                                        </IconButton> 
                                    }
                                    </div>
                                </div>
                                <Divider/>
                                {listingsOpen  && 
                                    <div className="listings-text">
                                        No listings yet.
                                    </div>
                                }
                            </div>
                            <div className="detail-make-btn mt-4">
                                <div className="d-flex flex-row justify-content-between showMore" onClick={handleCollapseOffer}>
                                    <div className="d-flex flex-row" >
                                        <DnsIcon style={{ marginTop:3, fontSize: 25, marginRight:5 }}/>
                                        <p>Offers</p> 
                                    </div>
                                    <div>
                                    {offerOpen  ? 
                                        <IconButton className="arrow-btn mb-2" onClick={handleCollapseOffer}>
                                            <ExpandLessIcon/>
                                        </IconButton>
                                                :
                                        <IconButton className="arrow-btn mb-2" onClick={handleCollapseOffer}>
                                            <ExpandMoreIcon/>
                                        </IconButton>
                                    }
                                    </div>
                                </div>
                                <Divider/>
                                {offerOpen  && 
                                    <div className="offer-text">
                                        No offers yet
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <div className="model2-view detail-make-btn" style={{ overflow: "auto", width: "100%", padding: 20 }}>
                    <ReactMarkdown  rehypePlugins={[rehypeRaw]} children={markdown}/>
                </div>
            </div>
        </Layout> 
        
        : <Layout><h5>Loading...</h5></Layout>
    )
}


const mapStateToProps = createStructuredSelector({
    activeModel: makeSelectActiveModel(),
});

const withConnect = connect(mapStateToProps, null);

export async function getServerSideProps({ params }) {
    return {
        props: { params },
    };
}
export default compose(withConnect)(ModelPage);

