/**This is a program which acts as a interface between django web server which acts as a FTP(file Transfer Protocol )Server
  *Here we use both Nodejs and Django where
   Nodejs:Used to communicate with MySql Database to store user details and bring up the images stored as per the user name
   Django:Acts as a FTP server which stores and retrieves files as per the client request
   Here the css used is "Bulma"
   This is the first program in which I have used Client Side Form Validation

   Note:The ipaddress of the client and server PC differs every time when restarted ,so change the axios request as 
   per the changed ip every time or it will not work
     */





<template>
  <div class="hello ">
    <div class="modal is-active"><!-- opens a popup window like interface-->
          <div class="modal-background"></div>
          <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">DICOM Images</p><!--Holds the heading of the program-->
      </header>
      <section class="modal-card-body">
      <div v-if=!imge>
        <!-- The starting page of the program -->
        <!-- Here I use v-validate (used by importing VeeValidate using command npm install --save vee-validate) 
        This is used to validate user input in client side processing .-->
      Customer Name:<input v-validate="'required'" name="name" class="input is-text" type="text" list="quer" @input="autoc()"  v-model="customer.name">
      <!-- Checks whether if the name exists in the database-->
      <button @click="fetch()" class="button is-info has-text-light has-text-weight-bold">Check Name</button>
      <span class="help is-danger">{{ errors.first('name') }}</span>
      <!-- If there are any errors in the input field validation ,it is displayed as a small text below it,where it shows the first 
      error present in that input field validation-->
      <datalist id="quer"><!-- The datalist acts as a autocomplete suggestion box 
             shows the suggestion as a list of options-->
            <option v-for="queries in query" v-bind:value="queries.name"  v-bind:label="queries.name"></option>
          </datalist><br>
          <!-- While using radio buttons ,all the inputs must have the same v-model otherwise they are not linked-->
      Gender:<input type="radio" name="gender" v-validate="'required'" v-model="customer.gender" value="Male">Male
             <input type="radio" name="gender" v-validate="'required'" v-model="customer.gender" value="Female">Female
             <input type="radio" name="gender" v-validate="'required'" v-model="customer.gender" value="Other">Other
             <span class="help is-danger">{{ errors.first('gender') }}</span>
      <br>
      <button class="button is-primary has-text-light has-text-weight-bold" @click="regtodb()">Register</button><!--Registers the
      info to the Database and gives us back the id of that person inserted-->
      </div>
      <div v-if="imge"><!--Renders the page only if condition is true-->
        <!--After Registration or Login ,this page appears-->
        Customer ID:{{customer.id}}<br>
        Do you want to view or add images<br>
        <button class="button is-primary has-text-light has-text-weight-bold" @click="check();imga=false">View</button>
        <button class="button is-primary has-text-light has-text-weight-bold" @click="imga=true;imgv=false;imgob=false;">Add</button>
        <div v-if="imgv"><!--If the View Button is Pressed-->
            <select width="20px" v-validate="'required'" name="part" class="select is-info" @change="getimage()" v-model="part" >
              <option class="home" disabled value="">Please select one</option><!-- Acts like a placeholder -->
              <option v-for="option in dir">{{option}}</option><!-- Shows the options held in option data array , the data shown is entirely taken -->
    </select>
    <span class="help is-danger">{{ errors.first('part') }}</span>
        </div>
        <div v-if="imgob"><!--After Selecting the folder name , the images present in that directory is displayed one by one-->
          <div class="modal is-active"><!-- A seperate modal window is opened here -->
          <div class="modal-background"></div>
          <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Images</p>
      <button class="delete" @click="imgob=false" aria-label="close"></button><!--CLoses the image preview window-->
    </header>
    <section class="modal-card-body">
          <!-- Experimental Feature (Not Tested)(Loading Screen)-->
         <div v-show="loading" class="pageloader is-active is-"> </div>
          <img :src=img>
          <button class="button is-primary has-text-light has-text-weight-bold" v-show="l" @click="left()"><</button>
          <button class="button is-primary has-text-light has-text-weight-bold" v-show="r" @click="right()">></button>
          
          </section>
        </div>
        </div>
        </div>
        <div v-show="imga"><!-- In case ,if the add button is pressed -->
          Enter the name of the part<br><input type="text" v-validate="'required'" name="part" v-model="part" @keyup.enter="check()"><span class="help is-danger">{{ errors.first('part') }}</span>
          <br>
        <div v-for="(ing) in customer.image">

          <!-- Important point to note: to enable file handling in firefox we must send a "$event" property along with the function
          just for multi browser functionality-->
          <input type="file" class="is-centered" @change="upload($event)" multiple ref="files" >
        </div>
        <!--Saves the images obtained in the FTP server --> 
        <button class="button is-primary has-text-light has-text-weight-bold" @click="save()">Save</button></div>
        </div>
      </section>
        </div>
    </div>
  </div>
</template>

<script>
var axios = require('axios')//Used for HTML requests
var router =require('../router');//This syntax changes starting from latest version of vue
var vue = require('vue').default//Dont know why, but using default allows the usage of (vue.use) function
var VeeValidate = require('vee-validate')//Form validation features
vue.use(router)
vue.use(VeeValidate)
import 'bulma-extensions/bulma-pageloader/dist/css/bulma-pageloader.min.css'
import 'bulma-extensions/bulma-checkradio/dist/css/bulma-checkradio.min.css'
// import 'bulma/dist/css/bulma.css' incase if html not works
export default {
  data(){
    return{
      l:false,//The l and r boolean are used as buttons to display the images one by one
      r:true,
      imgob:false,//Boolean value to enable or disable image viewer
      imgv:false,//Boolean value to enable or disable image directory selector dialog
      imga:false,//Boolean value to enable or disable image saving to FTP server dialog
      imge:false,//Boolean value to enable or disable the next page after login or registration
      query:[],//Holds the details of the autocomplete fomr
      customer:{name:"",//Object which holds the basic details
      gender:[],
      id:"",
      image:[{}]},//Used for holding multiple data
    images:[{}],//Holds the file data to be uploaded
    loading:false,//Experimental features(not tested yet)
    img:"",//Holds the data of the image to be viewed
    part:"",//Holds the directory name of the images to be viewed or added
    dir:[],//Holds the list of directories saved by the person
    count:0,//Counter for displaying image one by one
    imgcnt:0//Holds the maximum number of images present
    }
  },
  mounted(){
    this.$validator.validate()//Used by the vee-validate ,run to make the vee-validate run at startup
    //Shows error messages right from the start ,used because the buttons work even if no data is present inside it
    //This is used because of v-if cases or v-for cases,solved by adding a key to the field
  },
  methods:{
    regtodb(){//Used to register details to db and obtain the id for the name
      if(this.errors.has('name')||this.errors.has('gender')){alert("The fields must not be empty");return 0}//Doesnt execute if errors 
      //are found in validation
      var custo =[this.customer.name,this.customer.gender]
      axios.put("http://192.168.1.7:3000/getid",custo).then((response)=>{
        this.customer.id=String(response.data.id)
        this.imge=true
      }) 
    },
    upload(event){
     
      console.log(event)
     // var target = event.target||event.srcElement    //Experimental feature ,to make it work for IE9 
      for(var i=0;i<event.target.files.length;i++){//Used for multiple file upload
      this.images.push(event.target.files[i])||window.event.target.files[i]}
      this.customer.image.push({})
      console.log(this.images[2].name)
    },
    save(){if(this.errors.has('part')){alert("type the folder name");return 0}//Save images to database
      let nam=this.customer.name
      for(var i=1;i<this.images.length;i++){//Send images one by one
      var form=new FormData()//Formdata used for multipart form data (like raw images,data,etc other than basic data types)
      form.append("myfile",this.images[i])//Append the data to a file named myFile(changed as per django requirement)
      axios({method:'post',//The order in which the data is set is 
            url:'http://192.168.1.6:8000/file_upload/'+nam+'/'+this.part+'/',
            data:form,
            headers: { 'Content-Type': 'multipart/form-data'}}).then((response)=>{
        console.log(response.data)
      }).catch((err)=>{
        console.log(err)
      })
      }
    },
    autoc(){//The autocomplete form list in the name input box
      axios.get("http://192.168.1.7:3000/autoc/",{params:{name:this.customer.name}}).then((response)=>{
         this.query=(response.data.data)
         console.log(this.query)
    })},
    check(){//Checks if there are any directories uploaded by client
      if(!this.errors.has('name')){
      let fol = this.part
      if(this.query!==0){
      axios({method:'get',//The order in which the data is set is 
            url:'http://192.168.1.6:8000/getcount/'+this.customer.name+'/'
            }).then((response)=>{
        console.log(response.data.data)
        this.dir=response.data.data
        if(this.dir.length==0){alert("No image present");this.imga=true}else{this.imgv=true}//Runs if no directories are present
      }).catch((err)=>{
        console.log(err)
      })
      }}else{console.log("errors found")}
    },
    getimage(){//The directory name is selected and this function returns the number of images present inside it
     axios({method:'get',
           //The order in which the data is set is 
            url:'http://192.168.1.6:8000/imagecount/'+this.customer.name+'/'+this.part+'/'
            }).then((response)=>{
        console.log(response.data.count)
        this.imgcnt=response.data.count
        console.log(this.imgcnt)
        this.findimg()
  })
    },
    fetch(){//Checks whether if the user exists in the database
      if(this.errors.has('name')){alert("The Field Must Not be Empty");return 0}
      if(this.query!==undefined){
      this.customer.id=this.query[0].id;this.imge=true}else{alert("The Name Doesn't Exist")}
    },
    findimg(){//Returns the first image from the directory for viewing
      axios({method:'get',
       responseType:'blob',//For obtaining the raw data as a binary file which is then decoded to view the image
  url:'http://192.168.1.6:8000/dcm1/'+this.customer.name+'/'+this.part+'/'+this.count+'/'}).then((response)=>{
    console.log(response.data)
    let blob = new Blob([response.data], { type: 'image/png' } );//Here the data obtained is referenced to a var called blob
     this.img = window.URL.createObjectURL(blob);//conversion of raw to blob and to base64
    this.imgob=true
    })},
    right(){//gives the next image in the directory
      this.l=true
      if(this.count>this.imgcnt-2){this.r=false;return 0}else{this.r=true}
        console.log(this.count,this.imgcnt) 
        this.loading=true;setTimeout(()=>{this.loading=false},600)     
        this.count+=1
        this.findimg()
        
    },
    left(){//Gives the previous image in the directory
      this.r=true
      console.log(this.count,this.imgcnt)    
      if(this.count<1){this.l=false;return 0}else{this.l=true}      
        this.count-=1
        this.loading=true;setTimeout(()=>{this.loading=false},600)
        this.findimg()  
    }
  }
}
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<!-- the loader is a custom class used as loading screen while the image loads and the keyframes-->
<style scoped>
h3 {
  margin: 40px 0 0;
}
@import '~bulma/bulma.sass';
.loader {
    border: 16px solid #f3f3f3; /* Light grey */
    border-top: 16px solid #3498db; /* Blue */
    border-radius: 50%;
    width: 120px;
    height: 120px;
    animation: spin 2s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>
