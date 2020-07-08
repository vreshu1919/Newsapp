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
                  pagenum: 1,
                  viewsmap : new Map(),
                  apikey: "f1c662dc68e14d058ea78ccba5448484",
                  query: '',
                  isloading : true,
                  pageurl : "https://newsapi.org/v2/sources?apiKey=70c030aa0b77453e98ed18165f56dcf8" ,
    };
  }

  onfieldChange = (event) => {
    console.log(event.target);
    this.setState({ query: event.target.value});
  }

  handleButton = (event) => {

    if(event.target.value === 'All'){
      var pageurl = "https://newsapi.org/v2/top-headlines?country=in&apiKey=" + this.state.apikey;
    }
    else{
      pageurl = "https://newsapi.org/v2/top-headlines?q=" + event.target.value + "&apiKey=" + this.state.apikey
    }
    var row = null;
    console.log(pageurl)
    fetch(pageurl).then((response) => {
      row = response.json();
      row.then((result) => {
        console.log(result['articles'])
        var jsondata = result["articles"]; 
        this.setState({data: [...jsondata, this.state.data]});
        this.state.data.map((elem,itr)=>{
          this.setState({dict: elem.title})
          console.log(this.state.dict)
          console.log(itr)
          this.setState({arraysize: this.state.data.length - 1 })
        })
      });
    })
  }

  handleSubmit = (event) => {

    event.preventDefault();
    console.log(event.target);
    
    var pageurl = "https://newsapi.org/v2/top-headlines?country=in&q=" + this.state.query + "&apiKey=" + this.state.apikey;

    var row = null;
    fetch(pageurl).then((response) => {
      row = response.json();
      row.then((result) => {
        this.setState({query: ""});
        console.log(result['articles'])

        var jsondata = result["articles"]; 
        this.setState({data: [...jsondata, ...this.state.data]});

        if(result['articles'].length == 0){
          this.setState({arraysize: 0})
        }
        else if(result['articles'].length == 1){
          this.setState({arraysize: 2})
        }
        else{
          
        this.state.data.map((dataelem,itr) => {
          console.log(this.state.data.length)
          this.setState({arraysize: this.state.data.length - 1 })
         })
        }
      });
    })
  }

nextpage = (event) => {
  console.log(event.target)
  event.preventDefault();

  var t = parseInt(event.target.value)+1
  this.setState({pagenum: t});
  console.log(this.state.query);
  var pageurl;
  console.log(this.state.pagenum);
  if(this.state.query === ""){
    pageurl = "https://newsapi.org/v2/top-headlines?country=in&page="+this.state.pagenum + "&apiKey=" + this.state.apikey
  }
  else{
    pageurl = "https://newsapi.org/v2/top-headlines?country=in&q=" + this.state.query + "&page="+this.state.pagenum+ "&apiKey=" + this.state.apikey
  }
  
        console.log(pageurl); 
        console.log(this.state.pagenum);
    var row = null;
    fetch(pageurl).then((response) => {
      row = response.json();
      row.then((result) => {
        console.log(result['articles'])
        var jsondata = result["articles"]; 
        //jsondata.map((jdata) => {this.state.data.push(jdata) });
        this.setState({data: [...jsondata, this.state.data]});

        this.state.data.map((dataelem,itr) => {
          console.log(this.state.data.length)
          this.setState({arraysize: this.state.data.length - 1 })
        })
      });
    })
}

prevpage = (event) => {
  event.preventDefault();
  var t = parseInt(event.target.value)-1
  if(t <=1){
    this.setState({pagenum:1});
  }
  else{  
  this.setState({pagenum: t});
  }
  

  var pageurl;
  if(this.state.query === ""){
    pageurl = "https://newsapi.org/v2/top-headlines?country=in&page=" + this.state.pagenum + "&apiKey=" + this.state.apikey
  }
  else{
    pageurl = "https://newsapi.org/v2/top-headlines?country=in&page=" + this.state.pagenum + "&apiKey=" + this.state.apikey;
  }
  
  console.log(this.state.pagenum);
  
        console.log(pageurl);
        console.log(this.state.pagenum);
    var row = null;
    fetch(pageurl).then((response) => {
      row = response.json();
      row.then((result) => {
        console.log(result['articles'])
        var jsondata = result["articles"]; 
        this.setState({data: [...jsondata, this.state.data]});

        this.state.data.map((dataelem,itr) => {
          console.log(this.state.data.length)
          this.setState({arraysize: this.state.data.length - 2 })
        })
      });
    })
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

  componentDidMount(){
  var url = "https://newsapi.org/v2/top-headlines?country=in&apiKey=" + this.state.apikey;
   var row = null;
    fetch(url).then((response) => {
      row = response.json();
      row.then((result) => {
        console.log(result['articles'])
        var jsondata = result["articles"]; 
        
        //jsondata.map((jdata) => {this.state.data.push(jdata) });
        this.setState({data: [...jsondata, this.state.data]});

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

  render() {
    if(this.state.isloading){
      return (<h1 style={{textAlign: "center"}}>LOADING</h1>)
    }
    else if(this.state.arraysize < 1){
      return (
        <div>
          <h1 style={{textAlign: "center", margin: "300px"}}>No Data Here</h1>
          <button style={{textAlign: "center"}} type="button" className="btn btn-secondary text-center" value = {'All'} onClick = { this.handleButton}>All</button>
          
        </div>
      )
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
        
        {this.state.data.slice(0,this.state.arraysize-1).map((article,itr) => (
          
          <div className="container-fluid card" style={{ width: "18rem"}} >

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
        <div>{this.state.arraysize  > 2 ? <button type="button" className="btn btn-secondary" value = {this.state.pagenum} onClick = { this.nextpage} pquery = {this.state.query}>View More</button> : console.log("end of results") }</div>
  
      </div>
    );
  }
}
export default App;
