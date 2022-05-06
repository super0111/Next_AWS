import { Provider } from "react-redux";
import withReduxStore from "../utils/with-redux-store";
import Page from "../components/Page";
import '../styles/main.css'
  const TransferHub = ({ Component, pageProps, reduxStore }) => {
  return (
    <Provider store={reduxStore}>
    <Page>
      <Component {...pageProps} />
    </Page>
    </Provider>
  );
};
export default withReduxStore(TransferHub);