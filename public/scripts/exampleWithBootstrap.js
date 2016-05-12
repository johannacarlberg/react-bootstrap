// To get started with this tutorial running your own code, simply remove
// the script tag loading scripts/example.js and start writing code here.
var Form = ReactBootstrap.Form;
var FormGroup = ReactBootstrap.FormGroup;
var FormControl = ReactBootstrap.FormControl;
var Col = ReactBootstrap.Col;
var Button = ReactBootstrap.Button;
var ButtonToolbar = ReactBootstrap.ButtonToolbar;
var ListGroup = ReactBootstrap.ListGroup;
var ListGroupItem = ReactBootstrap.ListGroupItem;
var Alert = ReactBootstrap.Alert;
var Glyphicon = ReactBootstrap.Glyphicon;

var CommentBox = React.createClass({
  loadCommentsFromServer: function(){
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data){
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err){
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleCommentSubmit: function(comment){
    var comments = this.state.data;
    comment.id = Date.now();
    var newComments = comments.concat([comment]);
    this.setState({data: newComments});
    // submit to the server and refresh the list
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: comment,
      success: function(data){
        this.setState({data:data})
      }.bind(this),
      error: function(xhr, status, err){
        this.setState({data: comments});
        console.error(this.props.url, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function(){
    return {data: []}
  },
  componentDidMount: function(){
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  render: function(){
    return(
      <div className="commentBox">
        <h1>Comments</h1>
        <CommentList data={this.state.data} />
        <CommentForm onCommentSubmit={this.handleCommentSubmit} />
      </div>
    );
  }
});

var CommentList = React.createClass({
  render: function(){
    var commentNodes = this.props.data.map(function(comment){
      return (
        <Comment author={comment.author} key={comment.id}>
          {comment.text}
        </Comment>
      );
    });
    return (
      <div className="commentList">
        {commentNodes}
      </div>
    )
  }
});

var CommentForm = React.createClass({
  getInitialState: function(){
    return {author: '', text: ''};
  },
  handleAuthorChange: function(e){
    this.setState({author: e.target.value});
  },
  handleTextChange: function(e){
    this.setState({text: e.target.value})
  },
  handleSubmit: function(e){
    e.preventDefault();
    var author = this.state.author.trim();
    var text = this.state.text.trim();
    if(!text || !author){
      return;
    }
    this.props.onCommentSubmit({author: author, text: text});
    this.setState({author: '', text: ''})
  },
  render: function(){
    return (
        <Form horizontal className="commentForm" onSubmit={this.handleSubmit}>
        <FormGroup controlId="formHorizontalName">
          <Col md={8}>
            <FormControl
              type="text"
              placeholder="Your name"
              autocomplete="off"
              value={this.state.author}
              onChange={this.handleAuthorChange} />
          </Col>
        </FormGroup>

          <FormGroup controlId="formHorizontalComment">
            <Col md={8}>
              <FormControl
                type="textarea"
                placeholder="Say something..."
                value={this.state.text}
                onChange={this.handleTextChange} />
            </Col>
          </FormGroup>

           <ButtonToolbar>
             <Button type="submit" bsStyle="primary">Post</Button>
           </ButtonToolbar>
        </Form>
    )
  }
});

var Comment = React.createClass({
  rawMarkup: function(){
    var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    return {__html: rawMarkup};
  },
  render: function(){
    return(
      <ListGroup>
      <div className="comment">
          <ListGroupItem>
            <strong>
              {this.props.author}
            </strong>
            <Button className="pull-right">
              <Glyphicon glyph="trash" />
            </Button>
          <span dangerouslySetInnerHTML={this.rawMarkup()} />
            <LikeButton></LikeButton>
          </ListGroupItem>
      </div>
      </ListGroup>

    )
  }
});

var LikeButton = React.createClass({
  getInitialState: function() {
    return {liked: false};
  },
  handleClick: function(event) {
    this.setState({liked: !this.state.liked});
  },
  render: function() {
    var text = this.state.liked ? 'like' : 'haven\'t liked';
    // var css = this.state.liked ? 'like' : 'haven\'t liked';
    return (
      <p onClick={this.handleClick}>
        You {text} this
        <Button bsStyle="danger">
          <Glyphicon glyph="heart"/>
        </Button>
      </p>
    );
  }
});

// TODO: change className on the like button, and remove text when that is done
// TODO: Create the remove feature

ReactDOM.render(
  <CommentBox url="/api/comments" pollInterval={2000} />,
  document.getElementById('content')
);
