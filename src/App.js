import React, { Component } from "react";
import "./App.css";
import "./bootstrap.min.css";
import * as firebase from 'firebase';

var firebaseConfig = {
  apiKey: "AIzaSyCt-EjYFjOLDOSAZEcGfNX7Hl2KPy6sIss",
  authDomain: "newsapp-a2576.firebaseapp.com",
  databaseURL: "https://newsapp-a2576.firebaseio.com",
  projectId: "newsapp-a2576",
  storageBucket: "newsapp-a2576.appspot.com",
  messagingSenderId: "45308041757",
  appId: "1:45308041757:web:6f528842067e120b3a44f4",
  measurementId: "G-TR5WN81E70"
};

firebase.initializeApp(firebaseConfig);

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
                  arraysize: 0,
                  totalElements: 0,
                  pagenum: 1,
                  viewsmap : new Map(),
                  apikey: "70c030aa0b77453e98ed18165f56dcf8",
                  pginit: "http://cors-anywhere.herokuapp.com/",
                  query: '',
                  pageinit: 'http://ec2-18-222-83-136.us-east-2.compute.amazonaws.com:4500/',
                  isloading : true,

                  pageurl : "https://newsapi.org/v2/sources?apiKey=70c030aa0b77453e98ed18165f56dcf8" ,
    };
  }

  onfieldChange = (event) => {
    console.log(event.target);
    this.setState({ query: event.target.value});
  }

  FetchURL(pageurl){

    var row = null;
    console.log(pageurl)
    fetch(pageurl).then((response) => {
      row = response.json();
      row.then((result) => {
        console.log(result['articles'])
        var jsondata = result["articles"]; 
        this.setState({data: [...jsondata]});
        var s = result["totalResults"]
        this.setState({totalElements: s});

      });
    })

  }
  handleButton = (event) => {

    this.setState({pagenum: 1});
    this.setState({query: event.target.value})

    if(event.target.value === 'All'){
      var pageurl =  this.state.pageinit + "v2/top-headlines?country=in&apiKey=" + this.state.apikey;
    }
    else{
      pageurl =  this.state.pageinit + "v2/top-headlines?q=" + event.target.value + "&apiKey=" + this.state.apikey
    }
    
    this.FetchURL(pageurl)
    
  }

  fetchurl2(pageurl){

    var row = null;
    fetch(pageurl).then((response) => {
      row = response.json();
      row.then((result) => {
        this.setState({query: ""});
        console.log(result['articles'])

        var jsondata = result["articles"]; 
        this.setState({data: [...this.state.data, ...jsondata]});

        
      });
    })

  }

  handleSubmit = (event) => {

    event.preventDefault();
    console.log(event.target);
    console.log(this.state.query)
    
    var pageurl = this.state.pageinit + "v2/top-headlines?country=in&q=" + this.state.query + "&apiKey=" + this.state.apikey;

    this.FetchURL(pageurl);

    
  }

nextpage = (event) => {

        event.preventDefault();
        this.setState({pagenum: this.state.pagenum+1}, ()=>{

        console.log(this.state.query);
        var pageurl;
        console.log(this.state.pagenum);
        if(this.state.query === ""){
          pageurl = this.state.pageinit + "v2/top-headlines?country=in&page="+this.state.pagenum + "&apiKey=" + this.state.apikey
        }
        else{
          pageurl = this.state.pageinit + "v2/top-headlines?country=in&q=" + this.state.query + "&page="+this.state.pagenum+ "&apiKey=" + this.state.apikey
        }
  
        this.fetchurl2(pageurl);
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

fetchUrl(url){
  var row = null;
  fetch(url).then((response) => {
    row = response.json();
    row.then((result) => {   
      var jsondata = result["articles"]; 
      console.log(jsondata.length)
      var s = result["totalResults"]
      console.log(s)
      this.setState({data: [...this.state.data, ...jsondata]});
      this.setState({totalElements: s});


      console.log(this.state.totalElements);

      
      this.state.data.map((dataelem,itr) => {
        
        this.setState({arraysize: this.state.data.length - 2 })
        console.log(this.state.data.length)
        console.log(this.state.arraysize)
        if(this.state.data.length - itr >=2 ){
                 var reff = firebase.firestore().collection("times").doc(dataelem['title']);
                  reff.get().then((res) => {
                    if (!res.exists) {
                      reff.set({ views: 0 })
                        }})

                        
      }
      });

      var db = firebase.firestore().collection('times').get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          console.log(doc);
          this.setState({viewsmap:this.state.viewsmap.set(doc.id, doc.data())},()=>{console.log(this.state.viewsmap)})
        })
      })

      });

      this.setState({isloading: false});
    });
  
}

  componentDidMount(){
    if(this.state.pagenum == 1){
      var url = this.state.pageinit + "v2/top-headlines?country=in&apiKey=" + this.state.apikey;
      this.fetchUrl(url);

    }
    else{
      var url = this.state.pageinit + "v2/top-headlines?country=in&page=" +this.state.pagenum + "&apiKey=" + this.state.apikey;
      this.fetchUrl(url);
    }
  

  }
  

  render() {
    if(this.state.isloading){
      return (<h1 style={{textAlign: "center", margin: "300px"}}>LOADING</h1>)
    }

    return ( 
      <div className="App">
        <PrintJumbotron />
        <div className="btn-group" role="group" aria-label="Basic example">
          <button type="button" className="btn btn-secondary" value = {'All'} onClick = { this.handleButton}>All</button>
          <button type="button" className="btn btn-secondary" value = {'business'} onClick = { this.handleButton}>Business</button>
          <button type="button" className="btn btn-secondary" value = {'Entertainment'} onClick = { this.handleButton}>Entertainment</button>
          <button type="button" className="btn btn-secondary" value = {'General'} onClick = { this.handleButton}>General</button>
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

        <div>{this.state.totalElements !== this.state.data.length ? <button type="button" className="btn btn-secondary" value = {this.state.pagenum} onClick = { this.nextpage} pquery = {this.state.query}>View More</button> : console.log("end of results") }</div>
  
      </div>
    );
  }
}
export default App;
