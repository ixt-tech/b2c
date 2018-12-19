import React from 'react';
import {
  Form,
  Input,
  Label,
  Button,
  Segment,
  Select,
  Card,
  Grid,
} from 'semantic-ui-react';
import './styles.css';

class Product extends React.Component {

  state = { };

  constructor(props) {
    super(props);
  }

  componentDidMount = async () => {
  }

  getProductDetails = async () => {
    window.open('https://ixt.global/products/travel-crisis-protection', '_blank');
  }

  render() {
    return (
      <Card>
        <Card.Content>
          <Card.Header>Protection</Card.Header>
          <Card.Meta>Your current products</Card.Meta>
          <Card.Description>
            <Grid>
              <Grid.Column width={11}>
                Travel Crisis Protection
              </Grid.Column>
              <Grid.Column width={2}>
                <Button inverted onClick={this.getProductDetails}>Details</Button>
              </Grid.Column>
            </Grid>
          </Card.Description>
        </Card.Content>
      </Card>
    )
  }

}

export default Product;
