import React, { Component } from "react";
import "./App.css";
import "./bootstrap.min.css";
import * as firebase from 'firebase';

const firebaseConfig = {
  apiKey: "AIzaSyAJAp1tsb-Bnb4eNTAPs1W89WnE7lma5ck",
  authDomain: "news-app-1b18c.firebaseapp.com",
  databaseURL: "https://news-app-1b18c.firebaseio.com",
  projectId: "news-app-1b18c",
  storageBucket: "news-app-1b18c.appspot.com",
  messagingSenderId: "687664928502",
  appId: "1:687664928502:web:bd77b2bd31885ba8aa3ed7",
  measurementId: "G-JC85DDYEME"
};

firebase.initializeApp  (firebaseConfig);

function PrintJumbotron() {
  return (
    <div className="AppTemp jumbotron container-fluid">
      <h1> NEWSAPP </h1>
    </div>
  );
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { data: [],
                  totalElements: 0,
                  pageSize: 4,
                  pagenum: 1,
                  viewsmap : new Map(),
                  apikey: "f1c662dc68e14d058ea78ccba5448484",
                  pginit: "http://cors-anywhere.herokuapp.com/",
                  query: '',
                  category: 'general',
                  pageinit: 'http://ec2-18-222-83-136.us-east-2.compute.amazonaws.com:4500/',
                  isloading : true,
                  pageurl : "https://newsapi.org/v2/sources?apiKey=70c030aa0b77453e98ed18165f56dcf8" ,
    };
  }

  onfieldChange = (event) => {
    console.log(event.target);
    this.setState({ query: event.target.value});
  }

  FetchUrlForCategory(pageurl){
    var row = null;
    console.log(pageurl)
    fetch(pageurl).then((response) => {
      row = response.json();
      row.then((result) => {
        var jsondata = result["articles"]; 
        this.setState({data: [...jsondata]});
        var s = result["totalResults"]
        this.setState({totalElements: s});
        this.FetchAndDisplayData(this.state.data);
      });
    })

  }
  handleButton = (event) => {
    this.setState({pagenum: 1});
    this.setState({query: event.target.value})
    console.log(this.state.category)
    if(event.target.value === '' ){
      var pageurl =  this.state.pageinit + "v2/top-headlines?pageSize=" + this.state.pageSize + "&apiKey=" + this.state.apikey;
    }
    else{
      pageurl =  this.state.pageinit + "v2/top-headlines?pageSize=" + this.state.pageSize + "&q=" + event.target.value + "&apiKey=" + this.state.apikey
    }
    this.FetchUrlForCategory(pageurl)
  }

  fetchUrlForNextPage(pageurl){
    var row = null;
    fetch(pageurl).then((response) => {
      row = response.json();
      row.then((result) => {
        this.setState({query: ""});
        var jsondata = result["articles"]; 
        this.setState({data: [...this.state.data, ...jsondata]});
        this.FetchAndDisplayData(this.state.data)
      });
    })
  }

  handleSubmit = (event) => {
    event.preventDefault();
    var pageurl = this.state.pageinit + "v2/top-headlines?pageSize=" + this.state.pageSize + "&country=us&q=" + this.state.query + "&apiKey=" + this.state.apikey;
    this.FetchUrlForCategory(pageurl);
  }

  newnextpage = () =>{

      this.setState({pagenum: this.state.pagenum+1}, ()=>{
      var pageurl;
      console.log(this.state.pagenum);
      if(this.state.query === ""){
        pageurl = this.state.pageinit + "v2/top-headlines?country=us&pageSize=" + this.state.pageSize + "&page="+this.state.pagenum + "&apiKey=" + this.state.apikey
      }
      else{
        pageurl = this.state.pageinit + "v2/top-headlines?country=us&pageSize=" + this.state.pageSize + "&q=" + this.state.query + "&page="+this.state.pagenum+ "&apiKey=" + this.state.apikey
      }
      this.fetchUrlForNextPage(pageurl);
});
}

updatedb = (title)=> {

  var reff = firebase.firestore().collection("times").doc(title);
        reff
          .update({
            views: firebase.firestore.FieldValue.increment(1),
          }).then(()=>{
            this.setState({viewsmap:this.state.viewsmap.set(title,{'views':this.state.viewsmap.get(title)['views'] +1 } )},()=>{console.log(this.state.viewsmap)})
          })
}

FetchAndDisplayData(data){

  this.state.data.map((dataelem,itr) => {
      
             var reff = firebase.firestore().collection("times").doc(dataelem['title']);
              reff.get().then((res) => {
                if (!res.exists) {
                  reff.set({ views: 0 })
                    }})

            
  });

  var db = firebase.firestore().collection('times').get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      //console.log(doc);
      this.setState({viewsmap:this.state.viewsmap.set(doc.id, doc.data())})
    })
  })

}

fetchUrl(url){
  var row = null;
  fetch(url).then((response) => {
    row = response.json();
    row.then((result) => {   
      var jsondata = result["articles"]; 
      var s = result["totalResults"]
      this.setState({data: [...this.state.data, ...jsondata]});
      this.setState({totalElements: s});
      this.FetchAndDisplayData(this.state.data);
      });
      this.setState({isloading: false});
    });
    
}

  componentDidMount(){

    var url = this.state.pageinit + "v2/top-headlines?country=us&pageSize=" + this.state.pageSize + "&page=" +this.state.pagenum + "&apiKey=" + this.state.apikey;
      this.fetchUrl(url);

    window.onscroll = (ev) => {
      if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight) {
        if(this.state.totalElements !== this.state.data.length){
          
          this.newnextpage()
        }
        else{
          alert("You have reached the end of NewsFeed")
          return;

        }
      }
    }

  }

  render() {
    if(this.state.isloading){
      return (<h1 style={{textAlign: "center", margin: "300px"}}>LOADING</h1>)
    }

    if(this.state.totalElements === 0){
      return (<div>
                  <h1 style={{textAlign: "center"}}>NO DATA </h1>
                  <button type="button" className="btn btn-secondary" style={{textAlign: "center"}} value = {'All'} onClick = { this.handleButton}>Homepage</button>
                  </div>
            )
    }

    return ( 
      <div className="App">
        <PrintJumbotron />
        <div className="btn-group" role="group" aria-label="Basic example">
          <button type="button" className="btn btn-secondary" value = {'All'} onClick = { this.handleButton}>General</button>
          <button type="button" className="btn btn-secondary" value = {'business'} onClick = { this.handleButton}>Business</button>
          <button type="button" className="btn btn-secondary" value = {'Entertainment'} onClick = { this.handleButton}>Entertainment</button>
          <button type="button" className="btn btn-secondary" value = {'Health'} onClick = { this.handleButton}>Health</button>
          <button type="button" className="btn btn-secondary" value = {'Sports'} onClick = { this.handleButton}>Sports</button>
          <button type="button" className="btn btn-secondary" value = {'Science'} onClick = { this.handleButton}>Science</button>
          <button type="button" className="btn btn-secondary" value = {'Technology'} onClick = { this.handleButton}>Technology</button>
        </div>

        <form onSubmit = {this.handleSubmit}>

          <div className="form-group container-fluid">
              <h3 htmlFor="exampleInputEmail1">Search here</h3>
              <input type="text" className="form-control" value = {this.state.query} onChange = {this.onfieldChange}/>
          </div>
          
        </form>
        
        {this.state.data.map((article,itr) => (
          
          <div className="container-fluid card" style={{ width: "80%"}} >

            <img className="card-img-top" src={article.urlToImage} alt="Card image cap"/>
            <div className="card-body">
              <h2 className="card-title">{article.title} </h2>
              <p className="card-text">{article.description}</p>
            </div>
            <div className="card-body">
              <a href={article.url} className="card-link" target="_blank" onClick = {()=> this.updatedb(article.title) } >
                Read More
              </a>
              
              <h6 > VIEWS : {this.state.viewsmap.get(article.title) ? this.state.viewsmap.get(article.title)['views'] : 0 } times</h6>
            </div>
            
          </div>
          
        ))}

        
      </div>
    );
  }
}
export default App;
