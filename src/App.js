import React from 'react';
import './App.css';
import"bootstrap/dist/css/bootstrap.min.css";

class App extends React.Component{

 constructor(props){
    super(props);
      this.state={
        todolist:[],
        activeItem:{
          id:null,
          title:'',
          completed:false,

        },
        editing:false,
      }
      this.fetchTasks=this.fetchTasks.bind(this) /*always point to the correct component instance*/
      this.handlechange=this.handlechange.bind(this)
      this.handlesubmit=this.handlesubmit.bind(this)
      this.getCookie=this.getCookie.bind(this)
      this.startdelete=this.startdelete.bind(this)
      this.startedit=this.startedit.bind(this)
      this.startstrike=this.startstrike.bind(this)

    };
     getCookie(name) {
      let cookieValue = null;
      if (document.cookie && document.cookie !== '') {
          const cookies = document.cookie.split(';');
          for (let i = 0; i < cookies.length; i++) {
              const cookie = cookies[i].trim();
              // Does this cookie string begin with the name we want?
              if (cookie.substring(0, name.length + 1) === (name + '=')) {
                  cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                  break;
              }
          }
      }
      return cookieValue;
  }
  
    componentDidMount(){this.fetchTasks()} //trigger the "fetchtasks" method before the component mounts
                                            //mounting is creating inserting component into documnet object model(doc) making it visible on the screen//
      fetchTasks()
      {console.log('fetching...')
      fetch('http://127.0.0.1:8000/api/task-list/')
      .then(response => response.json())
      .then(data=>
        this.setState({
          todolist:data
       })  
      )
      }
      handlechange(e){
        var name=e.target.name
        var value=e.target.value
        console.log('name:',name)
        console.log('value:',value)
        this.setState({

          activeItem:{
            ...this.state.activeItem,
            title:value
          }
        })
      }
      handlesubmit(e){
        e.preventDefault()
        console.log("item",this.state.activeItem)
        var csrftoken =this.getCookie('csrftoken')
        var url ='http://127.0.0.1:8000/api/task-create/'

        if(this.state.editing === true){
          url =`http://127.0.0.1:8000/api/task-update/${ this.state.activeItem.id}` /*use `(tilt) when indicating a pk or id in the URL */
          this.setState({
            editing:false
          })
          fetch(url,{
            method:'PUT',
            headers:{
              'content-type':'application/json',
              'X-CSRFToken':csrftoken,
            },
            body:JSON.stringify(this.state.activeItem)
          }).then((response) =>{
            this.fetchTasks()
            this.setState({
  
              activeItem:{
                id:null,
                title:'',
                completed:false,
      
              }
            })
          }).catch(function(error){
            console.log("ERROR",error)
          })
        }

        fetch(url,{
          method:'POST',
          headers:{
            'content-type':'application/json',
            'X-CSRFToken':csrftoken,
          },
          body:JSON.stringify(this.state.activeItem)
        }).then((response) =>{
          this.fetchTasks()
          this.setState({

            activeItem:{
              id:null,
              title:'',
              completed:false,
    
            }
          })
        }).catch(function(error){
          console.log("ERROR",error)
        })
        

      }

      startedit(task){
        this.setState({
          activeItem:task,
          editing:true,
        })
      }
      
      startdelete(task){
        var csrftoken= this.getCookie('csrftoken')
        var url =`http://127.0.0.1:8000/api/task-delete/${ task.id}`

        fetch(url,{
          method:'DElETE',
          headers:{
            'content-type':'application/json',
            'X-CSRFToken':csrftoken,
          },
        
      }).then((respose)=>
       this.fetchTasks(),
      )

    }
      startstrike(task){
        task.completed=!task.completed
        console.log("completed",task.completed)
        var csrftoken= this.getCookie('csrftoken')
        var url =`http://127.0.0.1:8000/api/task-update/${ task.id}`

        fetch(url,{
          method:'PUT',
          headers:{
            'content-type':'application/json',
            'X-CSRFToken':csrftoken,
          },
          body:JSON.stringify({'completed': task.completed,})

      }).then((respose)=>
       this.fetchTasks(),
      )
       
    }
  
  render(){
    var tasks =this.state.todolist
    var self= this
    return(
      <div className='container'>
        <div id='task-container'>
          <div id='form-wrapeer'>
            <form onSubmit={this.handlesubmit} id='form'>
              <div className='flex-wrapper'>
                <div style={{flex:8}}>
                  <input onChange={this.handlechange} className='form-control' id='title' value={this.state.activeItem.title} type='text' name='title'  placeholder='Add task'>
                  </input>
                </div>
                <div style={{flex:1}}>
                  <input id='submit' className='btn btn-warning' type='submit' name='Add'>
                  </input>
                </div>
              </div>
           </form>
          </div>       
          <div id="list-wrapper">
              {
                tasks.map(function(task,index){
                  return(
                    <div key={index} className="task-wrapper flex-wrapper" >
                      <div onClick={()=>self.startstrike(task)} style={{flex:5} }>
                        {task.completed===false?(
                          <span>{task.title}</span>
                        ):(
                          <strike>{task.title}</strike>
                        )}
                        
                      
                      </div>
                      <div style={{flex:1}}>
                        <button onClick={()=> self.startedit(task)} className='btn btn-sm btn-outline-info'>edit</button>
                      </div>
                      <div style={{flex:1}}>
                        <button  onClick={()=> self.startdelete(task)} className='btn btn-sm btn-outline-info'>-</button>
                      </div>

                    </div>
                  )

                })
              }

          </div>
        </div>
      </div>
    )

  }
}

export default App;
