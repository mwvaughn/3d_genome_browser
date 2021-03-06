var isFirstTimeWrongInputEntry=true,isChipSeqAvailable=false,isCustomerData=false,isInProgress=true,isDrawingBox=true, IF_CORRECT_BEHAVIOUR=true,ChangeCameraPositionBoolean=true;
var customerData, contents, file, progress_bar_div, spinner;
var previousLength=0;
var boxLines=[];
var previousTimeOutId, timeOutId;

var DEFAULT_INCOORD_ENTRY;
var opts={lines:9,length:20,width:9,radius:16,corners:1,rotate:0,direction:1,color:'#000',speed:1,trail:62,shadow:false,hwaccel:false,className:'spinner',zIndex:2e9,top:'50%',left:'50%'};

var globalArrayForWindow;
var MAX_WAIT_INTERVAL=10000;
var waitInterval=0;
var resp_count=0, req_count=0;
var draw_tube_response_counter=0, draw_tube_request_counter=0;
var tableStrContent='';
var healthness;
var STEP;
var NUMBER_LIMIT;
var isOneCubeOctree=true;
var ucsc_window;

var rgn;/*made it global for table*/
var urlParams;
(window.onpopstate=function (){
    var match,
        pl    =/\+/g,  /* Regex for replacing addition symbol with a space*/
        search=/([^&=]+)=?([^&]*)/g,
        decode=function (s){return decodeURIComponent(s.replace(pl, " ")); },
        query =window.location.search.substring(1);

    urlParams={};
    while (match=search.exec(query))
       urlParams[decode(match[1])]=decode(match[2]);
})();
(window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})());

$(document).ready(function() {
  $.ajaxSetup({ cache: false });
}); // to disable caching in getJSON

var serviceForStructure, particularChromosome, disease3Dexpression;
var current_cell_line;
var zeroCoordinate;
var startPositionOfCamera;
var scaleFactor; 
var blockSize;
var NODE_THRESHOLD=625;
var radiusOfTube=10;

var radiusSphere=40, segmentsWidth=32, segmentsHeight=16; /*sphere zone parameters*/
var maxRadiusSphere=140, minRadiusSphere=20;

function readFile(){
    previousLength=0;
    isInProgress=true;
    progress_bar_div=document.getElementById('progressBar');
    progress_bar_div.style.display='';
    $('p#progressBar').text("I'm still working on this file");
    var reader=new FileReader();
    reader.onload=function(event){
        contents=event.target.result;
        isInProgress=false;
    };
    reader.onerror=function(event){
        console.error("File cannot be read "+event.target.error.code);
        isInProgress=false;
    };
    file=document.getElementById("f").files[0];
    if (typeof file == 'undefined'){
        $('p#progressBar').text("Error:Select the file");
        isInProgress=false;
        return;
    }
    reader.readAsText(file);
    progressBarFunction();
    $('button#cleanButton').button("enable");
    isCustomerData=true;
    return false
}

function progressBarFunction(){
    
    if ((typeof contents === 'undefined')  || ( previousLength == 0 || previousLength != contents.length)){
        if ((typeof contents === 'undefined')) previousLength=0;
        else previousLength=contents.length;
        setTimeout(progressBarFunction, 1000);
    } else{
        $('p#progressBar').text("Done");
        customerData=JSON.parse(contents);
        contents='';
        for (var us in uploaded_splines){
            var tempArr=us.split('-');
            var chridOnlyNum=tempArr[0].replace(/([\d]+).*/,"$1");
            var arr=AdaptUploadedSpinesForCustomerData(parseInt(tempArr[1]), parseInt(tempArr[2]), chridOnlyNum);
            uploaded_splines[us][2]=arr[0];
            uploaded_splines[us][3]=arr[1];
            uploaded_splines[us][4]=chridOnlyNum;
        }
    }
}

wrong_all_dialog_message="Wrong format of input data. Please enter coordinates in format 'X,Y,Z' to specify your next location in Genome space. Also you can move to the place of particular part of specified chromosome. Format:'chr#,#,#'. Separator can be any symbol except for numeric one. In case of using 3d model of particular chromosomes you can use only this chromosome.<br>As well you can move to and color particular gene (if it exists in the database). Format 'chr#,NAME_OF_GENE'. Not available for simulated 3d model.";

wrong_gene_dialog_message="Wrong format of input data. Please use the following format:'NAME_OF_GENE'. Not available for simulated 3d model.";
if(!urlParams["3dmodel"]) IF_CORRECT_BEHAVIOUR=false;
if (IF_CORRECT_BEHAVIOUR)
    switch (urlParams["3dmodel"]){
        case "BCL-1":
        {
			modelInit(urlParams["3dmodel"],{x:1.5196, y:4.625, z:1.75},{x:3.674, y:3.361, z:3.635});
			break;
		}
        case "BCL-2":
        {
			modelInit(urlParams["3dmodel"],{x:2.607, y:3.066, z:2.406},{x:3.559, y:3.949, z:3.710});
			break;
		}
        case "BCL-3":
        {
			modelInit(urlParams["3dmodel"],{x:3.396, y:3.129, z:4.991},{x:4.119, y:3.450, z:3.734});
			break;
		}
        case "BCL-4":
        {
			modelInit(urlParams["3dmodel"],{x:4.637, y:1.413, z:2.748},{x:3.796, y:3.873, z:3.522});
			break;
		}
        case "BCL-5":
        {
			modelInit(urlParams["3dmodel"],{x:6.1960, y:4.679, z:4.901},{x:3.683, y:4.333, z:3.71});
			break;
		}
        case "BCL-6":
        {
			modelInit(urlParams["3dmodel"],{x:2.6, y:1, z:2.3},{x:4.195, y:2.678, z:2.882});
			break;
		}
        case "BCL-7":
        {
			modelInit(urlParams["3dmodel"],{x:2.522, y:2.827, z:2.662},{x:3.365, y:3.914, z:2.943});
			break;
		}
        case "BCL-8":
        {
			modelInit(urlParams["3dmodel"],{x:3.385, y:2.721, z:3.219},{x:4.092, y:2.764, z:2.549});
			break;
		}
        case "BCL-9":
        {
			modelInit(urlParams["3dmodel"],{x:1.129, y:2.349, z:2.752},{x:3.380, y:3.329, z:4.533});
			break;
		}
        case "BCL-10":
        {
			modelInit(urlParams["3dmodel"],{x:3.7, y:2.803, z:2.833},{x:4.024, y:2.872, z:3.472});
			break;
		}
        case "BCL-11":
        {
			modelInit(urlParams["3dmodel"],{x:2.918, y:3.042, z:2.071},{x:3.202, y:2.603, z:3.389});
			break;
		}
        case "BCL-12":
        {
			modelInit(urlParams["3dmodel"],{x:4.174, y:3.011, z:4.752},{x:3.668, y:5.033, z:3.868});
			break;
		}
        case "BCL-13":
        {
			modelInit(urlParams["3dmodel"],{x:3.916, y:2.103, z:2.204},{x:3.653, y:2.968, z:2.653});
			break;
		}
        case "BCL-14":
        {
			modelInit(urlParams["3dmodel"],{x:3.816, y:2.68, z:2.211},{x:4.92, y:3.037, z:2.962});
			break;
		}
        case "BCL-15":
        {
			modelInit(urlParams["3dmodel"],{x:2.288, y:2.289, z:2.673},{x:2.087, y:2.865, z:3.311});
			break;
		}
        case "BCL-16":
        {
			modelInit(urlParams["3dmodel"],{x:2.357, y:3.175, z:3.677},{x:3.035, y:2.191, z:2.98});
			break;
		}
        case "BCL-17":
        {
			modelInit(urlParams["3dmodel"],{x:2.637, y:2.742, z:2.201},{x:3.909, y:2.718, z:2.98});
			break;
		}
        case "BCL-18":
        {
			modelInit(urlParams["3dmodel"],{x:2.796, y:3.231, z:2.717},{x:3.46, y:3.149, z:2.529});
			break;
		}
        case "BCL-19":
        {
			modelInit(urlParams["3dmodel"],{x:2.423, y:3.006, z:2.78},{x:2.316, y:3.316, z:3.059});
			break;
		}
        case "BCL-20":
        {
			modelInit(urlParams["3dmodel"],{x:2.715, y:2.956, z:2.894},{x:2.401, y:3.649, z:2.709});
			break;
		}
        case "BCL-21":
        {
			modelInit(urlParams["3dmodel"],{x:3.977, y:2.976, z:2.649},{x:2.869, y:2.827, z:2.379});
			break;
		}
        case "BCL-22":
        {
			modelInit(urlParams["3dmodel"],{x:2.12, y:3.317, z:3.224},{x:2.715, y:2.87, z:2.625});
			break;
		}
        case "BCL-23":
        {
			modelInit(urlParams["3dmodel"],{x:2.209, y:6.194, z:3.093},{x:3.017, y:4.037, z:2.64});
			break;
		}
        case "BCH-1":
        {
			modelInit(urlParams["3dmodel"],{x:2.029, y:2.891, z:4.11},{x:3.307, y:2.986, z:3.163});
			break;
		}
        case "BCH-2":
        {
			modelInit(urlParams["3dmodel"],{x:3.2, y:3.56, z:2.016},{x:3.221, y:2.912, z:3.335});
			break;
		}
        case "BCH-3":
        {
			modelInit(urlParams["3dmodel"],{x:3.655, y:2.845, z:2.445},{x:3.242, y:2.788, z:3.168});
			break;
		}
        case "BCH-4":
        {
			modelInit(urlParams["3dmodel"],{x:2.071, y:3.09, z:2.8},{x:2.719, y:2.709, z:3.15});
			break;
		}
        case "BCH-5":
        {
			modelInit(urlParams["3dmodel"],{x:3.649, y:3.213, z:2.554},{x:3.43, y:2.714, z:2.742});
			break;
		}
        case "BCH-6":
        {
			modelInit(urlParams["3dmodel"],{x:2.484, y:1.679, z:2.816},{x:3.282, y:3.243, z:2.404});
			break;
		}
        case "BCH-7":
        {
			modelInit(urlParams["3dmodel"],{x:2.281, y:2.673, z:3.786},{x:2.21, y:3.01, z:2.852});
			break;
		}
        case "BCH-8":
        {
			modelInit(urlParams["3dmodel"],{x:2.646, y:2.639, z:3.975},{x:2.235, y:2.323, z:3.34});
			break;
		}
        case "BCH-9":
        {
			modelInit(urlParams["3dmodel"],{x:2.774, y:2.592, z:2.203},{x:3.109, y:2.36, z:2.615});
			break;
		}
        case "BCH-10":
        {
			modelInit(urlParams["3dmodel"],{x:2.67, y:2.532, z:2.819},{x:3.035, y:2.832, z:3.103});
			break;
		}
        case "BCH-11":
        {
			modelInit(urlParams["3dmodel"],{x:3.102, y:3.856, z:1.651},{x:2.335, y:3.214, z:2.8});
			break;
		}
        case "BCH-12":
        {
			modelInit(urlParams["3dmodel"],{x:4.111, y:2.711, z:2.234},{x:3.179, y:2.767, z:2.77});
			break;
		}
        case "BCH-13":
        {
			modelInit(urlParams["3dmodel"],{x:2.389, y:3.013, z:2.224},{x:2.885, y:3.011, z:3.111});
			break;
		}
        case "BCH-14":
        {
			modelInit(urlParams["3dmodel"],{x:1.553, y:2.197, z:2.906},{x:2.557, y:2.503, z:3.366});
			break;
		}
        case "BCH-15":
        {
			modelInit(urlParams["3dmodel"],{x:4.143, y:2.206, z:3.26},{x:2.924, y:2.945, z:2.9});
			break;
		}
        case "BCH-16":
        {
			modelInit(urlParams["3dmodel"],{x:4.039, y:2.558, z:1.93},{x:3.265, y:2.547, z:3.102});
			break;
		}
        case "BCH-17":
        {
			modelInit(urlParams["3dmodel"],{x:4.133, y:2.462, z:4.195},{x:2.592, y:3.204, z:3.074});
			break;
		}
        case "BCH-18":
        {
			modelInit(urlParams["3dmodel"],{x:2.42, y:2.792, z:2.167},{x:2.121, y:3.254, z:2.923});
			break;
		}
        case "BCH-19":
        {
			modelInit(urlParams["3dmodel"],{x:1.812, y:2.905, z:2.941},{x:2.23, y:3.005, z:2.405});
			break;
		}
        case "BCH-20":
        {
			modelInit(urlParams["3dmodel"],{x:3.494, y:4.208, z:2.451},{x:3.158, y:3.209, z:2.645});
			break;
		}
        case "BCH-21":
        {
			modelInit(urlParams["3dmodel"],{x:3.574, y:2.67, z:2.738},{x:3.532, y:2.256, z:2.405});
			break;
		}
        case "BCH-22":
        {
			modelInit(urlParams["3dmodel"],{x:3.455, y:3.31, z:2.923},{x:2.669, y:3.21, z:2.494});
			break;
		}
        case "BCH-23":
        {
			modelInit(urlParams["3dmodel"],{x:3.166, y:3.753, z:2.67},{x:2.938, y:3.217, z:2.784});
			break;
		}
        default:
        {
            modelInit(urlParams["3dmodel"],{x:0, y:10, z:0},{x:400.0, y:150.0, z:0.0})
            break;
        }
    }

var lastRegion, lastIntersection;
/* var arrayOfCHIPCoveredTubes=[];*/
var lastMode;
var _messi;
var meter;
var minMeter, maxMeter, stepScroll;
var is_modal_opened=false;
var mod_message_div;
var MAX_CHIP_LVL=1000;
var MIDDLE_FIXED_HEIGHT_SCREEN=603;/*625;*/
var MIN_FIXED_HEIGHT_SCREEN=480;/*550*/
var MIN_FIXED_HEIGHT_SCREEN_WO_THERMOMETER=400;/*467;*/
var STANDARD_FIXED_HEIGHT_UI_TABS_NAV=42.48;
var percentColors=[
    {pct:0.0, color:{r:0x00, g:0xff, b:0 } },
    {pct:0.5, color:{r:0x88, g:0x88, b:0 } },
    {pct:1.0, color:{r:0xff, g:0x00, b:0 } } ];
var is_coloring_of_chipseq=false;
var deb_var=[];
var lastBlockIndicesStr;
var regexpPattern=/^([\d\.\-]+)[^\d\-]+([\-\.\d]+)[^\d\-]+([\d\.\-]+)[^\d\-]*/i;
var regexpPatternChrms;
var regexpPatternGene=/^[\s]*([^\s]+)\s*$/;
var regexpPatternURL=/([\dXY]{1,2})[_]*([abAB]*)[^\d]+([\d]+)[^\d]+([\d]+)/ ;
var divElement;
var test_mesh;
var distance_FirstPoint=null, distance_SecondPoint=null, distance_line=null;
var DEBUG=false;
/* zero point in local coordinates translates into zeroCoordinate in the model coordinates        */
/* 1 point in the model coordinates= scaleFactor points in local coordinates*/

var camera, scene, renderer, controls;
var infoBlock, staticBlock, keys_block, footerPanel, imgTextContainer, distancePoints_block, messenger_block, if_messenger_error_chkBox;
var if_messenger_error=false, isNonDisplayThermometer=false;
var selectionMesh, targetBall;
var basesInSelection=1500;
var sphere;
var uploaded_area={}, uploaded_splines={}, uploaded_splines_chip={}, uploaded_splines_selection={}, uploaded_splines_genes={}, chipSecCubes={}, tube_continuation_map={};
var time=Date.now();
/* 3d dna molecules*/
var objects=[], chipObjects=[], geneObjects=[], suggestionGeneInCube={}, regionData={}, checkboxes=[];

/* dark screen, when the game starts*/
var blocker=document.getElementById( 'blocker' );
var instructions=document.getElementById( 'instructions' );            
var position="";
var snp_chip_seq_window;
var is_plane_mode=true; /*start with linear mode*/
var mode_name='Linear mode';
var mode_id=0;
var NUMBER_OF_MODES=3;
var leftPoint=null, rightPoint=null, assumedPoint=null;
var geneDrawQueue=[];

function modelInit(model, _startPositionOfCamera, _zeroCoordinate){
    zeroCoordinate=_zeroCoordinate;
    if (DEBUG) console.log(_startPositionOfCamera)
    if (model.match(/^bcl-([1-9]|1[0-9]|2[0-3]|[xy])$/i)){
        current_cell_line='B-cell';
        isChipSeqAvailable=false;
        serviceForStructure="3d";
        particularChromosome=parseInt(urlParams["3dmodel"].split("-")[1]);
        name_of_model="B-Cell, Leukemia, Chromosome "+particularChromosome;
        healthness="m=leukemia";
        disease3Dexpression=healthness+"&chr="+particularChromosome+"&";
        /* scaleFactor=12000; blockSize=0.8;*/
        scaleFactor=5000; blockSize=1;
        NODE_THRESHOLD=NODE_THRESHOLD*scaleFactor/10;
        radiusOfTube=scaleFactor/12000*60; /*was 25*/
        minRadiusSphere=70;
        maxRadiusSphere=180;
        radiusSphere=100;
        NUMBER_LIMIT=50000;
        STEP=500000; /*normal vs leukemia statistical approximation*/
        regexpPatternChrms=/^(chr\s*([1-9]|1[0-9]|2[0-3]|[xy])[_ab]*\s+)*\s*([\d]+)[^\d]+([\d]+)[^\d]*/i;
        DEFAULT_INCOORD_ENTRY='7571719-7590868';
    } else if (model.match(/^bch-([1-9]|1[0-9]|2[0-3]|[xy])$/i)){
        current_cell_line='GM06990';
        isChipSeqAvailable=true;
        serviceForStructure="3d";
        particularChromosome=parseInt(urlParams["3dmodel"].split("-")[1]);
        name_of_model="B-Cell GM06990, Healthy, Chromosome "+particularChromosome;
        healthness="m=normal";
        disease3Dexpression=healthness+"&chr="+particularChromosome+"&";
        /* scaleFactor=12000; blockSize=1; // before 1300 | 3*/
        scaleFactor=5000; blockSize=1; /* before 1300 | 3*/
        NODE_THRESHOLD=NODE_THRESHOLD*scaleFactor/10;
        /* radiusOfTube=60; //was 25*/
        radiusOfTube=scaleFactor/12000*50; /*was 25*/
        minRadiusSphere=70;
        maxRadiusSphere=180;
        radiusSphere=100;
        NUMBER_LIMIT=30000;
        STEP=200000; /*normal vs leukemia statistical approximation*/
        regexpPatternChrms=/^(chr\s*([1-9]|1[0-9]|2[0-3]|[xy])[_ab]*\s+)*\s*([\d]+)[^\d]+([\d]+)[^\d]*/i;
        DEFAULT_INCOORD_ENTRY='7571719-7590868';
    } else{
        isChipSeqAvailable=true;
        disease3Dexpression="";
        current_cell_line='K562';
        name_of_model="K562 Cell Type, All Chromosomes, Simulation"
        scaleFactor=10; 
        blockSize=400;
        serviceForStructure="js_test";
        disease="";
        /* $('option#2').attr('disabled','disabled');*/
        STEP=700;
        regexpPatternChrms=/^(chr\s*([1-9]|1[0-9]|2[0-3]|[xy])[_ab]*\s+)([\d]+)[^\d]+([\d]+)[^\d]*/i
        DEFAULT_INCOORD_ENTRY='chr17 7571719-7590868';
    }
    document.getElementById('incoords').placeholder=DEFAULT_INCOORD_ENTRY;
    $("i#name_of_model").text(name_of_model);
    wrong_chrms_dialog_message="Wrong format of input data. Please, do use the following format:'"+((serviceForStructure=="3d")?"[chr#,]#,#', where the first part is optional":"chr#,#,#'")+". \nSeparator can be any symbol except for numeric one." +
    ((serviceForStructure=="3d")?" In terms of current model, you can use only "+particularChromosome+" chromosomes.":"");
    startPositionOfCamera=Global2local({x:_startPositionOfCamera.x, y:_startPositionOfCamera.y, z:_startPositionOfCamera.z});
}

function changeOptionFoo(indx){
    switch(indx){
        case 0:{
            DEFAULT_INCOORD_ENTRY=((serviceForStructure=='js_test')?'chr17 ':'')+'7571719-7590868';
            document.getElementById('incoords').placeholder=DEFAULT_INCOORD_ENTRY;
            break;
        }
        case 1:{
            DEFAULT_INCOORD_ENTRY='TP53';
            document.getElementById('incoords').placeholder=DEFAULT_INCOORD_ENTRY;
            break;
        }
        case 2:{
            DEFAULT_INCOORD_ENTRY=((serviceForStructure=='js_test')?'400:150:0':'2.607:3.066:2.406');
            document.getElementById('incoords').placeholder=DEFAULT_INCOORD_ENTRY;
            break;
        }
    }
}

function inputOnlineValidator(val, moveCameraChoice){
    if (val=="") return true;
    switch(moveCameraChoice){
        case "coords":
        {
            return val.match(regexpPattern)
        }
        case "chr-pos":
        {
            return val.match(regexpPatternChrms);
        }
        case "gene":
        {
            return val.match(regexpPatternGene);
        }
    }
    return false;
}

function validate(incoords, moveCameraChoice){
    if (incoords == ""){
        incoords=DEFAULT_INCOORD_ENTRY;
    }
    switch(moveCameraChoice){
        case "coords":
        {
            if (incoords.match(regexpPattern) != null){
                ChangeCameraPosition(incoords, 0);
                return true;
            } 
            break;
        }
        case "chr-pos":
        {
            var temp=incoords.match(regexpPatternChrms);
            if (temp){
                if (particularChromosome && temp[2] && String(temp[2]).toUpperCase() != String(particularChromosome).toUpperCase()){
                    $("#dialog-message").text(wrong_chrms_dialog_message).dialog("open");
                    return false;
                }
                ChangeCameraPosition(incoords, 1);
            } else{
                $("#dialog-message").text(wrong_chrms_dialog_message).dialog("open");
                    return false;
            }
            break;
        }
        case "gene":
        {
            var temp=incoords.match(regexpPatternGene);
            if (temp){
                ChangeCameraPosition(incoords, 2);
                break;
            } else{
                $("#dialog-message").text("Wrong format of input data. Please, enter only the name of the gene.").dialog("open");
                    return false;
            }
        }
    }
}

function getjsonChrPositionFunction(_chr, promoter_begin, bp, _temp_foo, isLeft, p){
    if (DEBUG) console.log("ppp="+p)
    $.getJSON("http://1kgenome.exascale.info/chr_pos?chrid="+_chr+"&bp="+bp+((!healthness)?"":"&"+healthness)+"?callback=?", 
    null,
    function(data){
        /* res_num++; //increase number of responses*/
        var t=promoter_begin-data[0];
        var k=t<0?-1:1;
        if (isLeft==true){/*from the left to right*/
            if (k==1){
                if (p >10){/*limit for the end of the strand*/
                    rightPoint=data;
                    _temp_foo(promoter_begin);
                    showErrorAlertModalWindow("Too far! Last point of the chromosome is shown.", "It looks like you are trying to look out the range of chromosome. Last point of the chromosome is shown.")
                } else{
                    assumedPoint=data[0]+k*p*STEP;
                    getjsonChrPositionFunction(_chr, promoter_begin, assumedPoint, _temp_foo, true, p+1);
                }
            } else{
                rightPoint=data;
                _temp_foo(promoter_begin);
            }
        } else if (isLeft==false && p>0){/*from the right to left*/
            if (k==-1){
                assumedPoint=data[0]+k*p*STEP;
                getjsonChrPositionFunction(_chr, promoter_begin, assumedPoint, _temp_foo, false, p+1);
            } else{
                leftPoint=data;
                _temp_foo(promoter_begin);
            }
        } else{/*when isLeft is undefined-first way*/
            /*if k == -1-we found right border, 1-we found left side*/
            if (k==-1){
                rightPoint=data;
                assumedPoint=data[0]+k*STEP;
                if (assumedPoint<0){
                    leftPoint=data;
                    _temp_foo(promoter_begin);
                } else 
                    getjsonChrPositionFunction(_chr, promoter_begin, assumedPoint, _temp_foo, false, 2);
            } else{
                leftPoint=data;
                assumedPoint=data[0]+k*STEP;
                getjsonChrPositionFunction(_chr, promoter_begin, assumedPoint, _temp_foo, true, 2);
            }
        }
    });
}
function ChangeCameraPosition(incoords, option){
    leftPoint=null;
    rightPoint=null;
    var foo=  function(){
                    if (ChangeCameraPositionBoolean)
                        setTimeout(foo, 50);
                };

    if (option == 0){
        var str=incoords.replace(regexpPattern, "$1:$2:$3");
        var arr=str.split(':');
        if (DEBUG) console.log(str);
        /*reset angle/rotation*/
        controls.getObject().rotation.y=0; /* Rotates Yaw Object*/
        controls.getObject().children[0].rotation.x=0; /* Rotates the Pitch Object*/
        var tempCoord=Global2local({x:parseFloat(arr[0]), y:parseFloat(arr[1]), z:parseFloat(arr[2])})
        controls.getObject().position.x=tempCoord.x;
        controls.getObject().position.y=tempCoord.y;
        controls.getObject().position.z=tempCoord.z;
        $('#tabs').tabs('option', 'active', 1);
    } else if (option == 1){
        var arr=incoords.match(regexpPatternChrms);
        if (parseInt(arr[3])>=parseInt(arr[4])){
            $("#dialog-message").text("Start position must be less than end position.").dialog("open");
            return false;
        }
        var _temp_foo=function (promoter_begin){
            var rate=((rightPoint[0]-leftPoint[0]==0)?0:(promoter_begin-leftPoint[0])/(rightPoint[0]-leftPoint[0]));
            var X_new=leftPoint[1]+rate*(rightPoint[1]-leftPoint[1]); 
            var Y_new=leftPoint[2]+rate*(rightPoint[2]-leftPoint[2]); 
            var Z_new=leftPoint[3]+rate*(rightPoint[3]-leftPoint[3]);
            controls.getObject().rotation.y=0; /* Rotates Yaw Object*/
            controls.getObject().children[0].rotation.x=0; /* Rotates the Pitch Object*/
            var vector=Global2localVector3({x:X_new, y:Y_new, z:Z_new});
            if (DEBUG) console.log(vector);
            vector.z=vector.z+blockSize*scaleFactor/20; /*shift for looking at the point or near that your need*/
            /*controls.getObject().position=vector;//v66*/
            controls.getObject().position.x=vector.x;
            controls.getObject().position.y=vector.y;
            controls.getObject().position.z=vector.z;
        }
        getjsonChrPositionFunction(((arr[2])?arr[2]:particularChromosome), parseInt(arr[3]), parseInt(arr[3]), _temp_foo); /*@TEST X_Y Chromosome*/
        $('#tabs').tabs('option', 'active', 1);
    } else if (option == 2){
        var str=incoords.replace(regexpPatternGene, "$1").toLowerCase();
        var promoterBegin;
        var isFound=false;
        var _chr=particularChromosome;
        var genePars;
        if ((!genedata[_chr] || !genedata[_chr][str]) && serviceForStructure == "3d"){
            for (var _v in genedata){
                if (_v == _chr) continue;
                if (genedata[_v][str]){
                    isFound=true;
                    $("#dialog-message").text("This gene doesn't exist in this chromosome. Try to change model with "+_v+" chromosome model.").dialog( "open" );
                    return false;
                }
            }
            if (!isFound){
                $("#dialog-message").text("This gene doesn't exist in our database. Make sure that you enter correct gene.").dialog( "open" );
                return false;
            }
        } else if (serviceForStructure != "3d"){
            for (var _v in genedata){
                if (genedata[_v][str]){
                    isFound=true;
                    _chr=_v;
                    genePars=genedata[_chr][str];
                    break;
                }
            }
            if (!isFound){
                $("#dialog-message").text("This gene doesn't exist in our database. Make sure that you enter correct gene.").dialog( "open" );
                return false;
            }
        } else{
            genePars=genedata[_chr][str];
        }

        if (genePars[0] == '+') promoterBegin=genePars[1]-1000;
        else promoterBegin=genePars[2]+1000;

        var _temp_foo=function (promoter_begin){
            var rate=(promoter_begin-leftPoint[0])/(rightPoint[0]-leftPoint[0]);
            var X_new=leftPoint[1]+rate*(rightPoint[1]-leftPoint[1]); 
            var Y_new=leftPoint[2]+rate*(rightPoint[2]-leftPoint[2]); 
            var Z_new=leftPoint[3]+rate*(rightPoint[3]-leftPoint[3]);
            controls.getObject().rotation.y=0; /* Rotates Yaw Object*/
            controls.getObject().children[0].rotation.x=0; /* Rotates the Pitch Object*/
            var vector=Global2local({x:X_new, y:Y_new, z:Z_new});

            vector.z=vector.z+blockSize*scaleFactor/20;/*shift for looking at the point or near that your need*/
            /* controls.getObject().position=vector; //v66*/
            controls.getObject().position.x=vector.x;
            controls.getObject().position.y=vector.y;
            controls.getObject().position.z=vector.z;

            /*add one new gene to draw on screen*/
            geneDrawQueue.push([_chr, str, false]);
        }
        getjsonChrPositionFunction(_chr, promoterBegin, promoterBegin, _temp_foo);
        $('#tabs').tabs('option', 'active', 1);
    }
}

function changeModeIndicator(){
    /*maybe it's not necessary */
    ClearInfo();
    switch(mode_id){
        case 0:/*linear mode*/
            if (lastMode == 2) cleanCHIPSEQdata();
            document.getElementById("letter-X-icon").style.display="inline-block";
            document.getElementById("thermometer").style.display="none";
            document.getElementById("letter-T-icon").style.display="none";
            mode_name='Linear mode';
            $('p#textmode').text(mode_name+' (TAB for info)');
            lastMode=0;
            break;
        case 1:/*cubic mode*/
            if (lastMode == 2) cleanCHIPSEQdata();
            document.getElementById("letter-X-icon").style.display="inline-block";
            document.getElementById("thermometer").style.display="none";
            document.getElementById("letter-T-icon").style.display="none";
            mode_name='Cubic mode';
            $('p#textmode').text(mode_name+' (TAB for info)');
            lastMode=1;
            break;
        case 2:/*CHiP-SEQ mode*/
            scene.remove(selectionMesh);
            document.getElementById("letter-X-icon").style.display="none";
            console.log("A "+isNonDisplayThermometer);
            if (!isNonDisplayThermometer)document.getElementById("thermometer").style.display="block";
            document.getElementById("letter-T-icon").style.display="inline-block";
            if (!isChipSeqAvailable) showErrorAlertModalWindow("ChIP-Seq Data is unavailable for this model.","ChIP-Sequencing Data is not available for this 3D model.", function(){mode_id ++;if (mode_id>=NUMBER_OF_MODES) mode_id=0;changeModeIndicator();});
            mode_name='CHiP-Seq mode';
            if (lastMode != 2){
                popupInProgressSymbol();
                drawChipSeqDataForCurrentCube();
            }
            $('p#textmode').text(mode_name+' (TAB for info)');
            lastMode=2;
            break;
        default:
            $('p#textmode').text('');
            break;
    }
}

function cleanCHIPSEQdata(blockIndicesStr){
    if (blockIndicesStr){
        for (var indx=chipObjects.length-1; indx>=0; indx--){
            if (chipObjects[indx].userData[0] == blockIndicesStr){
                scene.remove(chipObjects[indx]);
                delete uploaded_splines_chip[chipObjects[indx].name];
                chipObjects.splice(indx,1);
            }
        }
        delete chipSecCubes[blockIndicesStr];
    } else{
        for (var indx in chipObjects){
            scene.remove(chipObjects[indx]);
        }
        chipObjects=[];
        uploaded_splines_chip={};
        /* arrayOfCHIPCoveredTubes=[];*/
        chipSecCubes={};
    }
}

function sendChangeIn3DGBWindow(_chr, _start_position, _end_position) {
    var __chr = _chr.replace(/([\dXYxy]+).*/, "$1").replace('23','X')
    if (ucsc_window && !ucsc_window.closed) {
        ucsc_window.postMessage('changeIn3DGBWindow_O2R' +":"+ __chr + ',' + Math.floor(_start_position) + ',' + Math.floor(_end_position),'http://3dgb.cs.mcgill.ca')
    } else {
        ucsc_window = window.open("genome-maps-v3.0.0/genome-maps/genome-maps.html?region="+
            __chr+":"+Math.floor(_start_position)+"-" + Math.floor(_end_position), "WindowName", "fullscreen=1,0,status=0");
    }
    
}

function init_controls(){
    var element=document.body;
    var pointerlockchange=function ( event ){
        
        if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element){
            controls.enabled=true;
            blocker.style.display='none';
            changeModeIndicator();
        } else{
            controls.enabled=false;
            blocker.style.display='-webkit-box';
            blocker.style.display='-moz-box';
            blocker.style.display='box';
            if (!is_modal_opened) instructions.style.display='';
            disableMessengerBlock();
            $('p#textmode').text('');
            document.getElementById('detection-sign').style.display="none";
            keys_block.style.display="none";
            distancePoints_block.style.display="none";
        }
	}
    var pointerlockerror=function ( event ){
        instructions.style.display='';
        $('p#textmode').text('');
        disableMessengerBlock();
        is_modal_opened=false;
        keys_block.style.display="none";
        distancePoints_block.style.display="none";
    }

    var handleChangeInGenomeMapsWindow = function(e) {
        var action = e.data.split(':')[0]
        if(action == 'changeInGenomeMapsWindow_R2O') {
            var location_data = e.data.split(':')[1];
            var _chr = location_data.replace(regexpPatternChrms, '\$2');

            console.log("! = " + location_data + " -> " + serviceForStructure +"(" + (serviceForStructure == '3d') + ")" + " && "
                     + particularChromosome +" chr = "+_chr +"  ("+(particularChromosome == _chr)+")")
            
            console.log((serviceForStructure == 'js_test' && _chr) + " : " + (serviceForStructure == '3d' && particularChromosome == _chr))

            if ((serviceForStructure == 'js_test' && _chr) || (serviceForStructure == '3d' && particularChromosome == _chr)) {
                console.log("ChangeCameraPosition '" + location_data + "'" )
                ChangeCameraPosition(location_data, 1);
            }
        }
    }

    window.addEventListener('message', handleChangeInGenomeMapsWindow, false);

    var unloadFunc = function() {
        if (ucsc_window && !ucsc_window.closed) {
            ucsc_window.close();
        }
    }

    window.onunload = unloadFunc;



    /* Hook pointer lock state change events*/
    document.addEventListener( 'pointerlockchange', pointerlockchange, false );
    document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
    document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

    document.addEventListener( 'pointerlockerror', pointerlockerror, false );
    document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
    document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );
    window.addEventListener( "oncontextmenu", function ( event ){
    }, false );
    
    window.addEventListener("click",function(event){
        if(controls.enabled == true){
            if (mode_id == 0){/* only linear mode*/
                var _intersection=GetIntersection();
                if (_intersection == null){
                    /*@TOBEDISCUSSED:Shouldn't it cause error message?!  showErrorAlertModalWindow("Point the area firstly!");*/
                    return;
                }
                if (_intersection.object.name == "")
                    return;
                tableStrContent='';
                
                var object=_intersection.object;
                var obj_name=_intersection.object.name;
                var point=_intersection.point;
                var region=lastRegion;
                
                if (typeof region != 'undefinded' && region.length>0){
                    var custDataArrayObj={};
                    var custDataArray;
                    if (isCustomerData){
                        custDataArray=customerData[uploaded_splines[obj_name][4]].slice(uploaded_splines[obj_name][2],uploaded_splines[obj_name][3]+1);
                        
                        var startRegPos=parseInt(region[0].replace(/.*bases:\s*([\d]+)[^\d]+([\d]+).*/,'\$1'));
                        var endRegPos=parseInt(region[0].replace(/.*bases:\s*([\d]+)[^\d]+([\d]+).*/,'\$2'));
                        for (var indx=0; indx<custDataArray.length; indx++){
                            if ( custDataArray[indx][0]<startRegPos ) continue;
                            else if (custDataArray[indx][0]>endRegPos ) break;
                            else{
                                custDataArrayObj[custDataArray[indx][1]]=custDataArray[indx][2];
                            }
                        }
                    }    
                    var tbl=document.createElement('table');
                    tbl.setAttribute('id','table_linear');
                    var tbdy=document.createElement('tbody');
                    for (var track_internal_index=0; track_internal_index<region.length-1; ++track_internal_index){
                        var temp=region[track_internal_index].replace(/Selection:|style\s*=\s*\"[^\"]+"/g, "");
                        
                        var tr=document.createElement('tr');
                        var td=document.createElement('td');
                        if (track_internal_index == 2){/*isCustomerData && */
                                var mystr=region[track_internal_index].replace(/.*SNPs:\s/,"").replace(/<a [^>]*href=\"[^\"]*rs=([\d]+)">(rs[\d]+)<\/a>;\s*/g, "\$1,");
                                var arr=mystr.split(",");
                                tr=document.createElement('tr');
                                td=document.createElement('td');
                                appendStringAsNodes(td, "@SNPs/Genotype");
                                td.colSpan="2";
                                tr.appendChild(td);
                            
                                if (isCustomerData){
                                    td=document.createElement('td');
                                    appendStringAsNodes(td, "@Customer Data/Genotype");
                                    tr.appendChild(td);
                                }
                                tbdy.appendChild(tr);
                            /*itteration over all SNPs in system (not custom)*/
                                for (var i=0; i< arr.length-1;i++){
                                    tr=document.createElement('tr');
                                    td=document.createElement('td');
                                    appendStringAsNodes(td, "<a target=\"_blank\" href=\"http://www.ncbi.nlm.nih.gov/SNP/snp_ref.cgi?rs="+arr[i]+"\">rs"+arr[i]+"</a>");
                                    tr.appendChild(td);
                                    
                                    td=document.createElement('td');
                                    var snpGenotypeSys=region[3][i];
                                    appendStringAsNodes(td, snpGenotypeSys);
                                    tr.appendChild(td);
                                    if (isCustomerData){
                                        td=document.createElement('td');
                                        if (custDataArrayObj[String(arr[i])]||custDataArrayObj["rs"+String(arr[i])]){
                                            var snpGenotypeCust=custDataArrayObj[String(arr[i])]||custDataArrayObj["rs"+String(arr[i])];
                                            appendStringAsNodes(td, snpGenotypeCust);
                                            tr.appendChild(td);
                                            if (snpGenotypeSys == snpGenotypeCust || snpGenotypeSys == reverseLine(snpGenotypeCust)) tr.style.color="rgb(0,200,0)";
                                            else tr.style.color="rgb(255,0,0)";
                                            delete custDataArrayObj[String(arr[i])];
                                            delete custDataArrayObj["rs"+String(arr[i])];
                                        }
                                    }
                                    tbdy.appendChild(tr);
                                }
                            
                                /*print everything that is not in the list of System SNPs*/
                                if (isCustomerData && typeof custDataArrayObj != 'undefined' && Object.size(custDataArrayObj) >0 ){
                                    tr=document.createElement('tr');
                                    td=document.createElement('td');
                                    appendStringAsNodes(td, "@SNPs are not in the list/Genotype");
                                    td.colSpan="2";
                                    tr.appendChild(td);
                                    tbdy.appendChild(tr);
                                    for (var custDataIndx in custDataArrayObj){
                                        tr=document.createElement('tr');
                                        td=document.createElement('td');
                                        appendStringAsNodes(td, custDataIndx);
                                        td=document.createElement('td');
                                        appendStringAsNodes(td, custDataArrayObj[custDataIndx]);
                                        tr.appendChild(td);
                                        tbdy.appendChild(tr);
                                    }
                                }
                                    
                                tbdy.appendChild(tr);
                        }
                        else{
                            appendStringAsNodes (td, temp);
                            if (isCustomerData) td.colSpan="3";
                            else td.colSpan="2";
                            tr.appendChild(td)
                            tbdy.appendChild(tr);
                        }
                    }
                    tbl.appendChild(tbdy);
                    
                    drawMessiModalWindow(tbl, 'Linear data', '5vh', '10%');
                }
                return false;
            } else if (mode_id == 1){/* only cubic mode*/
                var _intersection=GetIntersection();
                if (_intersection == null){
                    /*@TOBEDISCUSSED:Shouldn't it cause error message?!  showErrorAlertModalWindow("Point the area firstly!");*/
                    return;
                }
                if (_intersection.object.name == "")
                    return;
                var modelPositionCamera=Local2global(controls.getObject().position);
	            var blockIndicesCamera=GetBlockIndices(modelPositionCamera);
                var blockIndicesPointer=_intersection.object.userData[1];

                if (!(blockIndicesCamera.x == blockIndicesPointer.x && blockIndicesCamera.y == blockIndicesPointer.y && blockIndicesCamera.z == blockIndicesPointer.z)){
                    showErrorAlertModalWindow('Choose the point in your cubic area','Choose the point <b>in your cubic area</b> to explore (or closest area).');
                    return false;
                }
                
                exitPointerLockFunction();
                
                tableStrContent='';
                var arrRequestInfo=buildCubeDataStructureSNPs(searchOctree());
                waitFunction(arrRequestInfo);
                return false;
            } else if (mode_id == 2){/* only for CHIP-SEq mode*/
                if (!isChipSeqAvailable) showErrorAlertModalWindow("ChIP-Seq Data is unavailable for this model.","ChIP-Sequencing Data is not available for this 3d model.", function(){mode_id ++;if (mode_id>=NUMBER_OF_MODES) mode_id=0;changeModeIndicator();});
                var __intersection=GetIntersectionCHIPSEQ();
                var _intersection=GetIntersection();

                if (__intersection){
                    var temp;
                    var tbl=document.createElement('table');
                    tbl.setAttribute('id','table_linear');
                    var tbdy=document.createElement('tbody');
                    var tr=document.createElement('tr');
                    var td=document.createElement('td');
                    appendStringAsNodes(td, "Chromosome/Positions");
                    tr.appendChild(td);
                    td=document.createElement('td');
                    appendStringAsNodes(td, "Transcription Factors");
                    tr.appendChild(td);
                    td=document.createElement('td');
                    appendStringAsNodes(td, "Effect Level");
                    tr.appendChild(td);
                    tbdy.appendChild(tr);
                    for (var inter_indx in __intersection){
                        tr=document.createElement('tr');
                        temp=uploaded_splines_chip[__intersection[inter_indx].object.name.replace(/^23/, 'x')];
                        td=document.createElement('td');
                        appendStringAsNodes(td, "<a target='_blank' href='http://genome.ucsc.edu/cgi-bin/hgTracks?db=hg19&position=chr"+temp[0]+"%3A"+temp[1]+"-"+temp[2]+"' >Chr "+temp[0]+" ("+temp[1]+"-"+temp[2]+")</a>");
                        tr.appendChild(td);
                        td=document.createElement('td');
                        appendStringAsNodes(td, temp[3]);
                        tr.appendChild(td);
                        td=document.createElement('td');
                        appendStringAsNodes(td, temp[4]);
                        tr.appendChild(td);
                        tbdy.appendChild(tr);
                    }
                    tbl.appendChild(tbdy);
                    drawMessiModalWindow(tbl, 'ChIP-Seq data', '5vh', '30%');
                    return ;
                } else{
                    showErrorAlertModalWindow("Point the colored area of Transcription Factors!","Point the colored area of Transcription Factors!");
                    return;
                }
            }
        }
    });

    instructions.addEventListener( 'click', function ( event ){
        instructions.style.display='none';
        /* Ask the browser to lock the pointer*/
        element.requestPointerLock=element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
        if ( /Firefox/i.test( navigator.userAgent ) ){

             /*var fullscreenchange=function ( event ){
                if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ){
                    document.removeEventListener( 'fullscreenchange', fullscreenchange );
                    document.removeEventListener( 'mozfullscreenchange', fullscreenchange );
                    element.requestPointerLock();
                }
            }
            document.addEventListener( 'fullscreenchange', fullscreenchange, false );
            document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );
            element.requestFullscreen=element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
            element.requestFullscreen();*/
            element.requestPointerLock();
            document.getElementById('detection-sign').style.display="none";
            keys_block_management();
            distancePoints_block.style.display="block";
        } else{
            element.requestPointerLock();
            document.getElementById('detection-sign').style.display="none";
            keys_block_management();
            distancePoints_block.style.display="block";
        }
    }, false );    
	{
        var GKeyDownHandler=function (event){
            var element=document.body;
            if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element )
                if (controls.isKeyEnabled){
                    console.log(event.keyCode)
                    switch ( event.keyCode ){
                        case 32:/*space*/
                        {   
                            var _intersection=GetIntersection();
                            var _rgn = rgn;
                            if (_rgn.length == 0) {
                                object=_intersection.object;
                                point=_intersection.point;
                                if (object.name == ""){
                                    return false;
                                }
                                if ((typeof uploaded_splines[object.name] === 'undefined')){
                                    if (DEBUG) console.log("Warning:undefined!!!"); 
                                    return false;
                                }
                                _rgn = GetSelectedTrackPoints(point, object.name);
                            }
                            //ALBU: CHECK THIS?!?!?!?!?!
                            console.log(_rgn[0] + "; " + _rgn[1] + "; " + _rgn[2])
                            sendChangeIn3DGBWindow(_rgn[0], _rgn[1], _rgn[2])
                            event.preventDefault();
                            break;
                        }
                        case 66:/*control shift B*/
                        {
                            if (event.shiftKey && event.ctrlKey){

                                isDrawingBox=!isDrawingBox; /*switch*/
                                if (isDrawingBox){
                                    for (var line in boxLines){
                                        scene.add(boxLines[line]);
                                    }
                                } else{
                                    for (var line in boxLines){
                                        scene.remove(boxLines[line]);
                                    }
                                }
                            }
                            break;
                        }
                        case 80:/*P-position*/
                        {
                            var current_position=Local2global(controls.getObject().position);
                            drawMessiModalWindow("Currently you are exploring model <i>"+name_of_model+"</i>. Your current coordinates are  ("+current_position.x.toFixed(3)+", "+current_position.y.toFixed(3) +", "+current_position.z.toFixed(3)+")<br><div class='button twitter' data-type='button_count'><a href='https://twitter.com/share' class='twitter-share-button' data-url='http://3dgb.cs.mcgill.ca' data-text='Found something interesting! Model:"+name_of_model+", Coordinates ("+current_position.x.toFixed(3)+","+current_position.y.toFixed(3) +","+current_position.z.toFixed(3)+")'>Tweet</a></div><div class='fb-like' data-share='true' data-width='450' data-show-faces='true'></div>"
                                , "Current position in model",null,null,null,true, undefined,undefined,function(){$.getScript("http://platform.twitter.com/widgets.js");});

                            break;
                        }
                        case 76:/* L-length/distance between two points*/
                        {
                            var getDistance=function(){
                                var distance=getDistanceBetweenTwoPoints(distance_FirstPoint[0], distance_SecondPoint[0], 4)
                                drawMessiModalWindow("Label1:("+distance_FirstPoint[0].x.toFixed(4)+", "+distance_FirstPoint[0].y.toFixed(4) +", "+distance_FirstPoint[0].z.toFixed(4)+");<br>Label2:("+distance_SecondPoint[0].x.toFixed(4)+", "+distance_SecondPoint[0].y.toFixed(4) +", "+distance_SecondPoint[0].z.toFixed(4)+");<br>Distance between labeled points="+distance+"<br>Use Shift-L to measure distance between two points again.", "Distance between model points",null,null,null,true);
                            }
                            var _intersn=GetIntersection();
                            if (event.shiftKey){
                                if (distance_FirstPoint){
                                    scene.remove(distance_FirstPoint[2]);
                                    distance_FirstPoint=null;
                                    document.getElementById("first-point-distance").style.display="none";
                                }
                                if (distance_SecondPoint){
                                    scene.remove(distance_SecondPoint[2]);
                                    distance_SecondPoint=null
                                    document.getElementById("second-point-distance").style.display="none";
                                }
                                if (distance_line){
                                    scene.remove(distance_line);
                                    distanceline=null;
                                }
                                if (_intersn == null) break;
                            } else if (_intersn == null){
                                if (distance_FirstPoint && distance_SecondPoint){
                                    getDistance();
                                    break;
                                } else{
                                    showErrorAlertModalWindow("Point the strand firstly!","Point the strand firstly!<br>To measure a distance between two points of genome, system requires any two points on the strands of any chromosome.");
                                    return;
                                }
                            }
                            if (_intersn.object.name == "")
                                return;

                            if (!distance_FirstPoint){
                                var localPoint=_intersn.point;
                                var sphere=drawPointSphere(localPoint);
                                distance_FirstPoint=[Local2globalVector3(_intersn.point), localPoint, sphere];
                                document.getElementById("first-point-distance").style.display="block";
                            } else if (!distance_SecondPoint){
                                var localPoint=_intersn.point;
                                var sphere=drawPointSphere(localPoint);
                                distance_SecondPoint=[Local2globalVector3(_intersn.point), localPoint, sphere];
                                var material=new THREE.LineBasicMaterial({color:0x000000});
                                var geometry=new THREE.Geometry();
                                geometry.vertices.push(distance_FirstPoint[1]);
                                geometry.vertices.push(distance_SecondPoint[1]);
                                distance_line=new THREE.Line(geometry, material);
                                scene.add(distance_line);
                                document.getElementById("second-point-distance").style.display="block";
                                getDistance();
                            } else{
                                getDistance();
                            }
                            break;
                        }
                        case 73:/*i*/
                            {  
                                suggestionGeneInCube={};
                                var modelPosition=Local2global(controls.getObject().position);
                                var blockIndices=GetBlockIndices(modelPosition);
                                var blockIndicesStr=Coords2Str(blockIndices);
                                var tempNameArr=[];
                                var _chr, _rangeBegin, _rangeEnd, genes;
                                for (var _obj in objects){
                                    if (objects[_obj].userData[0] == blockIndicesStr){
                                        tempNameArr=objects[_obj].name.split('-');
                                        _chr=tempNameArr[0].replace(/([\dXYxy]+).*/, "$1");
                                        if (!suggestionGeneInCube[_chr]) suggestionGeneInCube[_chr]={};
                                        _rangeBegin=parseInt(tempNameArr[1]);
                                        _rangeEnd=parseInt(tempNameArr[2]);
                                        genes=genedata[_chr];
                                        for (var _index in genes){
                                            if (_rangeBegin<genes[_index][1] && _rangeEnd>genes[_index][2]){
                                                suggestionGeneInCube[_chr][_index]=true;
                                            } else if ((_rangeBegin<genes[_index][1] && _rangeEnd>genes[_index][1]) ||
                                                (_rangeBegin<genes[_index][2] && _rangeEnd>genes[_index][2]) ||
                                                (_rangeBegin>genes[_index][1] && _rangeEnd<genes[_index][2])){/*gene is larger than strand*/
                                                suggestionGeneInCube[_chr][_index]=false;
                                            }
                                        }
                                        if (Object.size(suggestionGeneInCube[_chr]) == 0) delete suggestionGeneInCube[_chr];
                                    }
                                }
                                showSuggestionGeneInCubeWindow();
                                break;
                            }
                        case 84:/*t -in chipseq mode-show/delete the chipseq data in current cube (not the same cube where mode has been activated)*/
                            {
                                if (mode_id == 2){
                                    if (event.shiftKey) /* before it was case 82://r-in chipseq mode-arise everything, clean the memory. */
                                    {
                                        cleanCHIPSEQdata();
                                        break;
                                    }
                                    var modelPosition=Local2global(controls.getObject().position);
                                    var blockIndices=GetBlockIndices(modelPosition);
                                    var blockIndicesStr=Coords2Str(blockIndices);
                                    if (chipSecCubes[blockIndicesStr]){
                                        cleanCHIPSEQdata(blockIndicesStr);
                                        /* showErrorAlertModalWindow("ChIP-Seq data for current cube has been already shown.");*/
                                    } else{
                                        popupInProgressSymbol();
                                        drawChipSeqDataForCurrentCube();
                                        chipSecCubes[blockIndicesStr]=true;
                                    }
                                }
                                break;
                            }
                        case 88:/*x-get mapping ChIP-Seq data and SNPs*/
                            {
                                if (mode_id == 0){
                                    var _intersection=GetIntersection();
                                    if (_intersection == null){
                                        showErrorAlertModalWindow("Point the strand firstly!","Point the strand firstly!<br>To build a mapping between SNPs and ChIP Sequencing data, system requires area on the strand around which it can compute required relations.");
                                        return;
                                    }
                                    document.exitPointerLock=document.exitPointerLock ||
                                                            document.mozExitPointerLock ||
                                                            document.webkitExitPointerLock;
                                    document.exitPointerLock();
                                    keys_block.style.display="none";
                                    distancePoints_block.style.display="none";
                                    if ( /Firefox/i.test( navigator.userAgent ) ) exitFromFullScreen();
                                    init_new_window_SNP_CHIP_SEQ(rgn, true);
                                } else if (mode_id == 1){
                                    var _intersection=GetIntersection();
                                    if (_intersection == null){
                                        showErrorAlertModalWindow("Point the strand firstly!","Point the strand firstly!<br>To build a mapping between SNPs and ChIP Sequencing data, system requires area on the strand around which it can compute required relations.");
                                        return;
                                    }
                                    document.exitPointerLock=document.exitPointerLock ||
                                                            document.mozExitPointerLock ||
                                                            document.webkitExitPointerLock;
                                    document.exitPointerLock();
                                    keys_block.style.display="none";
                                    distancePoints_block.style.display="none";
                                    if ( /Firefox/i.test( navigator.userAgent ) ) exitFromFullScreen();
                                    init_new_window_SNP_CHIP_SEQ(_intersection.point, false);
                                }
                                break;
                            }
                        case 77:/*c-change mode*/
                            mode_id ++;
                            if (mode_id>=NUMBER_OF_MODES) mode_id=0;
                            changeModeIndicator();
                            break;  
                        case 9:/*tab-information about current mode*/
                            drawMessiModalWindow(textMessages[mode_name], mode_name, null, null, false, true);/*central*/
                            return false;
                    }
                }
                
        }

        /*scrolling event*/
		var scrollHandler=function (event){
            var element=document.body;
            if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ){
                
                if (event.detail != null && event.detail<0 || event.wheelDeltaY != null && event.wheelDeltaY>0){
                    if (mode_id == 0) basesInSelection=Math.min(maxMeter, basesInSelection+stepScroll);
                    if (mode_id == 1) radiusSphere=Math.min(maxRadiusSphere, radiusSphere+10);
                } else{
                    if (mode_id == 0) basesInSelection=Math.max(minMeter, basesInSelection-stepScroll);
                    if (mode_id == 1)radiusSphere=Math.max(minRadiusSphere, radiusSphere -10);
                }   
                event.preventDefault();/*to prevent sliding in different directions in case of error;*/
            }
			
		};
		var mousewheelevt=(/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll":"mousewheel";
		if (document.attachEvent) /*if IE (and Opera depending on user setting) */
        {
            document.attachEvent("on"+mousewheelevt, scrollHandler);
            document.attachEvent("onkeydown", GKeyDownHandler);
        }
		else if (document.addEventListener) /*WC3 browsers*/
        {
            document.addEventListener(mousewheelevt, scrollHandler, false);
            document.addEventListener("keydown", GKeyDownHandler, false);
        }
	}
}

function toggleAll(source){
    var _checkboxes=document.getElementsByName('checkBoxToColour');
    for(var i=0, n=_checkboxes.length;i<n;i++){
        _checkboxes[i].checked=source.checked;
    }
}

function showSuggestionGeneInCubeWindow(){
    checkboxes=[];
    var isFirst=true;
    var chkBox;
    var upperTbl=document.createElement('div');
    upperTbl.innerHTML="<input type='text' value='' placeholder='Search' id='inputFilter'></input>";
    var tbl=document.createElement('table');
    tbl.setAttribute('id','table_linear');
    tbl.setAttribute('class', 'order_table');
    var tbdy=document.createElement('tbody');
    var tr=document.createElement('tr');
    tr.setAttribute('class', 'guide');
    var td=document.createElement('th');
    appendStringAsNodes(td, "Chromosome");
    tr.appendChild(td);
    td=document.createElement('th');
    appendStringAsNodes(td, "Gene");
    tr.appendChild(td);
    td=document.createElement('th');
    appendStringAsNodes(td, "+/- strand");
    tr.appendChild(td);
    td=document.createElement('th');
    appendStringAsNodes(td, "Gene expression");
    tr.appendChild(td);
    td=document.createElement('th');
    td.innerHTML="In Cube<input type='image' onclick='new Messi(\"This column provides an information if specific gene fully located in this cube. In case of <i>false</i> you can colour it in current cube. To look at the whole gene, move to the neighbor cube. If gene was coloured partially and user moved to the neighbor cube to observe the gene, system will try to colour this gene fully.\",{title:\"Information\", center:true, modal:true, viewport:{top:\"5vh\", left:\"10%\"}, titleClass:\"info\" });' src='image/system_question_alt_02.png'/>"
    tr.appendChild(td);
    td=document.createElement('th');
    td.innerHTML="Color in cube<input type='image' onclick='new Messi(\"This column provides an opportunity to colour/hide gene in your current cube. That means it will be coloured/hidden in the cube where you are currently located.\",{title:\"Information\", center:true, modal:true, viewport:{top:\"5vh\", left:\"10%\"}, titleClass:\"info\" });' src='image/system_question_alt_02.png'/><br>[<input type='checkbox' onclick='toggleAll(this);'>]";
    tr.appendChild(td);
    tbdy.appendChild(tr);
    for (var _chr in suggestionGeneInCube){
        isFirst=true;
        for (var _gene in suggestionGeneInCube[_chr]){
            tr=document.createElement('tr');
            td=document.createElement('td');
            appendStringAsNodes(td, _chr);
            tr.appendChild(td);
            td=document.createElement('td');
            appendStringAsNodes(td, genedata[_chr][_gene][4]);
            tr.appendChild(td);
            td=document.createElement('td');
            appendStringAsNodes(td, genedata[_chr][_gene][0]);
            tr.appendChild(td);
            td=document.createElement('td');
            appendStringAsNodes(td, genedata[_chr][_gene][3].toFixed(2));
            tr.appendChild(td);
            td=document.createElement('td');
            appendStringAsNodes(td, suggestionGeneInCube[_chr][_gene]);
            tr.appendChild(td);
            td=document.createElement('td');
            chkBox=document.createElement('input');
            chkBox.type="checkbox";
            chkBox.name="checkBoxToColour"
            chkBox.checked=((_chr+"-"+_gene) in uploaded_splines_genes);
            td.appendChild(chkBox);
            checkboxes.push([_chr, _gene, chkBox, ((_chr+"-"+_gene) in uploaded_splines_genes), suggestionGeneInCube[_chr][_gene]]); /*chr, gene, <input>, wasCheckedBefore*/
            tr.appendChild(td);
            tbdy.appendChild(tr);
        }
        
        var funcCountCheckboxAndDrawGenes=function(){
            for (var _chk in checkboxes){
                if (checkboxes[_chk][3] == checkboxes[_chk][2].checked) continue;
                else if (checkboxes[_chk][3]){/*checkbox has been removed*/
                    DeleteGene(checkboxes[_chk][0], checkboxes[_chk][1]);
                } else{   /*checkbox has been set*/
                    geneDrawQueue.push([checkboxes[_chk][0], checkboxes[_chk][1], checkboxes[_chk][4]]); 
                }
            }
        }
    }
    tbl.appendChild(tbdy);
    upperTbl.appendChild(tbl);
    drawMessiModalWindow(upperTbl, 'Genes in current cube', '5vh', '30%', false, false, null, funcCountCheckboxAndDrawGenes);
    $('input#inputFilter').keyup(function(){
        var that=this;
        $.each($('table.order_table tbody tr'),
        function(i, val){
            if ($($('table.order_table tbody tr')[i]).attr('class') != 'guide' && $(val).text().toUpperCase().indexOf($(that).val().toUpperCase()) == -1){
                $('table.order_table tbody tr').eq(i).hide();
            } else{
                $('table.order_table tbody tr').eq(i).show();
            }
        });
    });
}

function waitFunction(arrRequestInfo){
    if (DEBUG) console.log(req_count +":"+resp_count);
    if (resp_count<req_count && waitInterval<MAX_WAIT_INTERVAL){
        waitInterval=waitInterval+50;
        setTimeout(function(){waitFunction(arrRequestInfo);}, 50);
    } else{
        var internalTemp;
        var tbl=document.createElement('table');
        tbl.setAttribute('id','table_linear');
        var tbdy=document.createElement('tbody');
        var tr=document.createElement('tr');
        var td=document.createElement('td');
        appendStringAsNodes(td, "Chromosome/positions");
        tr.appendChild(td);
        td=document.createElement('td');
        appendStringAsNodes(td, "SNPs");
        tr.appendChild(td);
        tbdy.appendChild(tr);
        if (!arrRequestInfo) arrRequestInfo=[];
        for (var i=0; i<arrRequestInfo.length; i++){
            internalTemp=arrRequestInfo[i];
            for (var j=0; j<internalTemp.length; j++){
                tr=document.createElement('tr');
                td=document.createElement('td');
                appendStringAsNodes(td, "Chr "+internalTemp[j][0][0]+" ("+internalTemp[j][0][1]+"-"+internalTemp[j][0][2]+")");
                tr.appendChild(td);
                td=document.createElement('td');
                var result='';
                var _temp=internalTemp[j][1].responseJSON;
                for (var it_indx in _temp){
                    result += " <a target=\"_blank\"  href=\"http://www.ncbi.nlm.nih.gov/SNP/snp_ref.cgi?rs="+_temp[it_indx][1]+"\">rs"+_temp[it_indx][1]+"</a>;";
                }
                appendStringAsNodes(td, result);
                tr.appendChild(td);
                tbdy.appendChild(tr);
            }
        }
        tbl.appendChild(tbdy);
        drawMessiModalWindow(tbl, 'Cubic data', '5vh', '30%', true);
    }
}

function drawChipSeqDataForCurrentCube(){
    var modelPosition=Local2global(controls.getObject().position);
    var blockIndices=GetBlockIndices(modelPosition);
    var blockIndicesStr=Coords2Str(blockIndices);

    var requestCHIP;
    var urlCHIP;
    var mapResponse=[];
    var jsonObj;
    req_count=0; /*HERE COULD BE PROBLEM WITH USING THE SAME GLOBAL VARIABLES*/
    resp_count=0; /*HERE COULD BE PROBLEM WITH USING THE SAME GLOBAL VARIABLES*/

    for (var _obj in objects){
        if (objects[_obj].userData[0] == blockIndicesStr){
            requestCHIP=objects[_obj].name.replace(regexpPatternURL, "chr=$1&start=$3&end=$4&celline="+current_cell_line);        
            requestCHIP=requestCHIP.replace('chr=23','chr=X');
            urlCHIP='http://1kgenome.exascale.info/chipseq?'+requestCHIP;
            req_count++;
            jsonObj=$.getJSON(urlCHIP+"?callback=?", null, function(data){resp_count++;});
            mapResponse.push([objects[_obj], jsonObj]);
        }
    }
    if (mapResponse.length == 0){
        hideInProgressSymbol();
        showErrorAlertModalWindow("No ChIP-Seq data in current cube.","There is no ChIP-Seq data to be shown in current cube. Please, move into one of the neighbor cubes to observe any data.");
        return;
    }
    waitInterval=0;
    waitFunctionForChipSeqData(mapResponse);
    chipSecCubes[blockIndicesStr]=true;
}

function waitFunctionForChipSeqData(mapResponse){
    if (DEBUG) console.log(req_count +":"+resp_count);
    if (resp_count<req_count && waitInterval<MAX_WAIT_INTERVAL){
        waitInterval=waitInterval+50;
        setTimeout(function(){waitFunctionForChipSeqData(mapResponse);}, 50);
    } else{
        for (var _resp in mapResponse){
            if (mapResponse[_resp][1].responseJSON){
                if (DEBUG) console.log("CHCHCH+"+mapResponse[_resp][0].name);
                chipseqDataPostionDeterminitionAndDrawCore(mapResponse[_resp][0].userData, mapResponse[_resp][0].geometry.vertices, uploaded_splines[mapResponse[_resp][0].name][1], mapResponse[_resp][1].responseJSON);
            }
        }
        hideInProgressSymbol();
    }
}

function drawChipSeqDataRunner(_intersection){
    var name=_intersection.object.name;
    var requestCHIP=name.replace(regexpPatternURL, "chr=$1&start=$3&end=$4&celline="+current_cell_line);
    requestCHIP=requestCHIP.replace('chr=23','chr=X');
    var urlCHIP='http://1kgenome.exascale.info/chipseq?'+requestCHIP;
    $.getJSON(urlCHIP+"?callback=?", null, 
        function(data){
            chipseqDataPostionDeterminitionAndDraw(data, _intersection);
        }
    );
}

/**
*ATTENTION!!! _vert1=uploaded_splines[name][1]
*Return:array (size=4) of start position in 'vertices' array, end position in 'vertices' array, vertices_start_position (for a loop to start from previous position), last_seen_interval_end (for a loop to start from previous position)
*/
function getApproximationForVerticesBeginEndPosition(vertices, _vert1, vertices_start_position, last_seen_interval_end, rangeBegin, rangeEnd, isVertUse){/* rangeBegin=data[ss][1], rangeEnd=data[ss][2]*/
    /* deb_var=_vert1;*/
    var vert_length=_vert1.length;
    var first_vert=-1;
    var second_vert=-1;
    var left_distance_begin, left_distance_end; /*in but without any values*/
    var start_node= -1, end_node= -1;
    var start_local_vector3, end_local_vector3

    if (DEBUG) console.log("rangeBegin "+rangeBegin+"; rangeEnd "+ rangeEnd+"; _vert1[vert_length-1][1]="+_vert1[vert_length-1][1])
    if (rangeEnd>=_vert1[vert_length-1][1]){
        second_vert=vertices.length-1;
        end_node =vert_length-1;
    }
    /*iterator for beginnings*/
    if (DEBUG) console.log("L:"+last_seen_interval_end);
    for (var kk=last_seen_interval_end; kk <vert_length; kk++){
        if (rangeBegin<_vert1[kk][1]){/* -------start--------v--*/
            last_seen_interval_end=kk;
            /*Local to global problems (change from distance in global space-to rate in any space (iuncluding local))*/
            left_distance_begin=(rangeBegin-_vert1[kk-1][1])/(_vert1[kk][1]-_vert1[kk-1][1]);/*changed!!!*/
            start_node=kk-1;
            break;
        }
    }

    if (start_node == -1){
        if (DEBUG) console.log("Start_node has not been defined ");
        return null;
    }

    if (second_vert == -1){
        /*iterator for ends*/
        for (var kk=last_seen_interval_end; kk <vert_length; kk++){
            if (rangeEnd<_vert1[kk][1]){/* -------end--------v--*/
                end_node=kk-1;
                /*Local to global problems (change from distance in global space-to rate in any space (iuncluding local))*/
                left_distance_end=(rangeEnd-_vert1[kk-1][1])/(_vert1[kk][1]-_vert1[kk-1][1]); /*changed!!!*/
                break;
            }
        }   
        if (end_node == -1){
            if (DEBUG) console.log("End_node has not been defined "+start_node+"-"+end_node);
            return null;
        }
    }
    
    if ((second_vert == -1 && end_node == -1) || start_node == -1){
        if (DEBUG) console.log("Nodes have not been defined "+start_node+"-"+end_node+"=vert.length "+second_vert);
        return null;
    }
    
    if (start_node == _vert1.length-1){
        end_node=start_node;
        start_node=start_node-1;
    } else if (end_node == start_node){
        if (DEBUG) console.log("Nodes has been artificially increased in size to be recognizable.");
        if (end_node == vert_length-1)
            start_node--;
        else{
            end_node++;
            left_distance_end=0;
        }
    }

    {
        var start_node_vector=Global2local({x:_vert1[start_node][2], y:_vert1[start_node][3],z:_vert1[start_node][4]});
        var next_to_start_node_vector=Global2local({x:_vert1[start_node+1][2], y:_vert1[start_node+1][3],z:_vert1[start_node+1][4]});
        start_local_vector3 =new THREE.Vector3((next_to_start_node_vector.x-start_node_vector.x)*left_distance_begin+start_node_vector.x,
            (next_to_start_node_vector.y-start_node_vector.y)*left_distance_begin+start_node_vector.y, 
            (next_to_start_node_vector.z-start_node_vector.z)*left_distance_begin+start_node_vector.z);
        var minDistance=-1;

        if (!isVertUse){
            for (var kk=vertices_start_position-parseInt(vertices_start_position/2); kk<vertices.length; kk++){
                distance=Math.pow(vertices[kk].x-start_local_vector3.x, 2)+
                    Math.pow(vertices[kk].y-start_local_vector3.y, 2) +
                    Math.pow(vertices[kk].z-start_local_vector3.z, 2);
                if (minDistance == -1 || (distance<minDistance)){
                    minDistance=distance;
                    first_vert=kk;
                }
            }
            vertices_start_position=first_vert;
            if (first_vert == -1){
                if (DEBUG) console.log("first_vert has not been defined ");
                return null;
            }    
        }

        if (first_vert==vertices.length-1){
            second_vert=first_vert;
            first_vert=findPreviousNotGroupedPoint(vertices, first_vert);
        }
        if (end_node ==vert_length-1){
            var end_local_vector3=Global2localVector3({x:_vert1[end_node][2], y:_vert1[end_node][3], z:_vert1[end_node][4]});    
        } else{
            var end_node_vector=Global2local({x:_vert1[end_node][2], y:_vert1[end_node][3], z:_vert1[end_node][4]});
            var next_to_end_node_vector=Global2local({x:_vert1[end_node+1][2], y:_vert1[end_node+1][3], z:_vert1[end_node+1][4]});
            end_local_vector3=new THREE.Vector3((next_to_end_node_vector.x-end_node_vector.x)*left_distance_begin+end_node_vector.x, 
                (next_to_end_node_vector.y-end_node_vector.y)*left_distance_begin+end_node_vector.y, 
                (next_to_end_node_vector.z-end_node_vector.z)*left_distance_begin+end_node_vector.z);    
        }

        if (isVertUse){
            return [start_node, end_node, null, last_seen_interval_end, start_local_vector3, end_local_vector3];
        }
        
        minDistance=-1;
        for (var kk=first_vert+1; kk<vertices.length; kk++){
            distance=Math.pow(vertices[kk].x-end_local_vector3.x, 2)+
                Math.pow(vertices[kk].y-end_local_vector3.y, 2) +
                Math.pow(vertices[kk].z-end_local_vector3.z, 2);
            if (minDistance == -1 || (distance<minDistance)){
                minDistance=distance;
                second_vert=kk;
            }
        }
    }
    return [first_vert, second_vert, vertices_start_position, last_seen_interval_end];
}

function chipseqDataPostionDeterminitionAndDrawCore(userDataChip, vertices, _vert1, data){
    var vertices_start_position=0;
    var last_seen_interval_end=1;
    var left_distance_begin, left_distance_end; /*in but without any values*/
    var start_node, end_node;
    var first_vert=-1;
    var second_vert=-1;
    for (var ss=0; ss <data.length; ss++){
        var temp=getApproximationForVerticesBeginEndPosition(vertices, _vert1, vertices_start_position, last_seen_interval_end, data[ss][1], data[ss][2], false);
        if (!temp) continue;
        vertices_start_position=temp[2];
        last_seen_interval_end=temp[3];
        first_vert=temp[0];
        second_vert=temp[1];

        var beginningTFVert=findPreviousNotGroupedPoint(vertices, first_vert); /*actual end of previous segment for beginning of TF strand (if it is not 0)*/
        var endTFVert=findNextNotGroupedPoint(vertices, second_vert); /*actual beginning of next segment after end of TF strand (if it is not last)*/
        var vert_cut=vertices.slice(((beginningTFVert!=0)?beginningTFVert+1:0), endTFVert-1);
        vert_cut=getNormalizedVerticesForVertCut(vert_cut);

        /*draw part*/
        {
            var tube_color=getColorForPercentage(data[ss][4]/MAX_CHIP_LVL);
            var material=new THREE.MeshLambertMaterial({color:tube_color, /*emissive:0xff0000,*/ ambient:0x000000, shading:THREE.SmoothShading, side:THREE.DoubleSide } );
            var spline=new THREE.SplineCurve3(vert_cut);
            var segments=vert_cut.length;
            var radiusSegments=5;
            var tube=new THREE.TubeGeometry( spline, segments, radiusOfTube*1.8, radiusSegments, false, false);
            tube.dynamic=true;
            var tubeMesh=new THREE.Mesh(tube, material);
            tubeMesh.userData=userDataChip;
            tubeMesh.name=data[ss][0]+"-"+String(data[ss][1])+"-" +String(data[ss][2]);
            uploaded_splines_chip[tubeMesh.name]=[data[ss][0], data[ss][1], data[ss][2], data[ss][3], data[ss][4]]
            scene.add(tubeMesh);
            chipObjects.push(tubeMesh);
        }
    }
}

function chipseqDataPostionDeterminitionAndDraw(data, _intersection){
    var userDataChip=_intersection.object.userData;
    /* var vertices=vertices of the intersection.object.geometry.vertices*/
    var vertices=_intersection.object.geometry.vertices;
    /* var data=data after*/
    var _vert1=uploaded_splines[_intersection.object.name][1];/*nodes*/
    chipseqDataPostionDeterminitionAndDrawCore(userDataChip, vertices, _vert1, data);
}

function getColorForPercentage(chipLvl){
    var pct=chipLvl;
    for (var i=1; i<percentColors.length-1; i++){
        if (pct<percentColors[i].pct) break;
    }
    var lower=percentColors[i-1];
    var upper=percentColors[i];
    var range=upper.pct-lower.pct;
    var rangePct=(pct-lower.pct) / range;
    var pctLower=1-rangePct;
    var pctUpper=rangePct;
    var color={
        r:Math.floor(lower.color.r*pctLower+upper.color.r*pctUpper)/255,
        g:Math.floor(lower.color.g*pctLower+upper.color.g*pctUpper)/255,
        b:Math.floor(lower.color.b*pctLower+upper.color.b*pctUpper)/255
    };
    return new THREE.Color().setRGB(color.r, color.g, color.b);
}

function init_new_window_SNP_CHIP_SEQ (intersectPoint, isPlaneMode){
    if (isPlaneMode){
        var _rgn=intersectPoint;
        var chrid=String(_rgn[0]);
        var chridNoStrand=chrid.split('_')[0];
        var chridOnlyNumber=chrid.replace(/([\dXYxy]+).*/, "$1");
        if (chridOnlyNumber[chridOnlyNumber.length-1] == "a")
            chridOnlyNumber=chridOnlyNumber.substr(0, chridOnlyNumber.length-1);
        snp_chip_seq_window=window.open("index2.html?isplane="+isPlaneMode+"&chr="+chridOnlyNumber.replace("23", 'x') 
                 +"&start="+String(Math.floor(_rgn[1]))
                 +"&end="+String(Math.floor(_rgn[2]))
                /*+ "&celline="+ current_cell_line*/, /*parameter of celline-will be hardcoded in the index2.html , top=500*/
                  "_blank", "scrollbars=yes, resizable=yes, top=500, left=500, width=400, height=400");
        return;
    } else{
        var intersectInModelCoordinates=Local2global(intersectPoint);
        globalArrayForWindow=searchOctree();
        var result='';
        for (var indx in globalArrayForWindow){
            result += globalArrayForWindow[indx].chr.replace("23", 'x')+"-"+((globalArrayForWindow[indx].helix)?globalArrayForWindow[indx].helix:"null" )+ ":";
            for (var indx2 in globalArrayForWindow[indx].intervals){
                result += Math.floor(globalArrayForWindow[indx].intervals[indx2].start)+"_"+Math.floor(globalArrayForWindow[indx].intervals[indx2].end)+"-";
            }
            result += ";";
        }
        var radiusSphereGlobal=radiusSphere/scaleFactor;
        snp_chip_seq_window=window.open("index2.html?isplane="+isPlaneMode+"&path="+result
           , /*parameter of celline-will be hardcoded in the index2.html , top=500*/
                  "_blank", "scrollbars=yes, resizable=yes, top=500, left=500, width=400, height=400");
        return;    
    }
}

var chrid2color={};
/* the pointerLock object has different name in different browsers*/
/* http://www.html5rocks.com/en/tutorials/pointerlock/intro/*/
var havePointerLock='pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
if (IF_CORRECT_BEHAVIOUR){
    if ( havePointerLock ){
    	init_controls();
    } else{
    	instructions.innerHTML="Your browser doesn\'t seem to support Pointer Lock API<br/>Supported browsers:Firefox, Google Chrome.";
    }
    init();
    animate();
} else{
    new Messi('Something goes wrong. Please, contact with <a style="color:rgb(0,0,255)" href="mailto:alexander.butyaev@mail.mcgill.ca?subject=[3D Genome Browser][Error Report]">Alexander Butyaev</a>. You can start from the <a href="index.html">beginning</a>. ',{title:'Error', center:true, modal:true, viewport:{top:'5vh', left:'10%'}, titleClass:'error' });
}

function init_light(){
        var light=new THREE.DirectionalLight( 0xffffff, 1.5 );
        light.position.set( 1, 1, 1 );
        scene.add( light );
        var light=new THREE.DirectionalLight( 0xffffff, 0.75 );
        light.position.set( -1,-0.5, -1 );
        scene.add( light );
}

/*probably trash*/
function InitSelectionMesh(){
	var spline=new THREE.SplineCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(100, 100, 100),]);
	var material=new THREE.LineBasicMaterial({color:0xff0000});
	var segments=10;
	var radiusSegments=6;
	var tube=new THREE.TubeGeometry(spline, segments, 20, radiusSegments, false, false);
	tube.dynamic=true;
	tube.verticesNeedUpdate=true;
	selectionMesh=new THREE.Mesh(tube, material);
	selectionMesh.name="selection_mesh";
    test_mesh=selectionMesh;
	scene.add(selectionMesh);          	
}

function UpdateTargetBallPosition(){
    var vector=new THREE.Vector3(0, 0, 0); /*THREE.js v66*/
	/* var raycaster=projector.pickingRay(vector, camera);//THREE.js v66*/
    vector.unproject( camera );
    var camera_pos=controls.getObject().position;
    var raycaster=new THREE.Raycaster(camera_pos, vector.sub( camera_pos ).normalize());/*THREE.js v69*/
	raycaster.ray.direction.normalize().multiplyScalar(50);
	var x=raycaster.ray.direction.x+raycaster.ray.origin.x;
	var y=raycaster.ray.direction.y+raycaster.ray.origin.y;
	var z=raycaster.ray.direction.z+raycaster.ray.origin.z;
	targetBall.position.set(x,  y, z);
	targetBall.geometry.verticesNeedUpdate=true;
	scene.remove(targetBall);   	
	scene.add(targetBall); 
}

function InitTargetBall(){
	var sphere=new THREE.SphereGeometry(0.5, 10, 10);
	sphere.dynamic=true;
	targetBall=new THREE.Mesh(sphere, new THREE.LineBasicMaterial({color:0xff0000}));
	targetBall.name="target_ball";            	
	UpdateTargetBallPosition();						          	
}
                                         
function getPositionRangeFromCubeIntersection(meshesSearch, radiusSphereImpl){
    if (!radiusSphereImpl) radiusSphereImpl=radiusSphere;
    var resultSet=[];
    var verts;
    
    var mentionedMeshes=[];
    var name, aLen;
    var chr, helix;
    var tempObject;
    for (var _mesh in meshesSearch){
        name=meshesSearch[_mesh].object.name;
        if (mentionedMeshes != null && ($.inArray(name, mentionedMeshes) != -1)){
            continue;
        }
        mentionedMeshes.push(name);
        tempObject=[];
        /*proportional calculations*/
        verts=meshesSearch[_mesh].object.geometry.vertices;
        aLen=verts.length;
        chr=(name.replace(regexpPatternURL, "$1"));
        /* helix=(name.replace(regexpPatternURL, "$2"));*/
        var minDistance=-1;
        var secMinDistance=-1;
        var closestPoint=-1;
        var secClosestPoint=-1;
        var distance=-1;
        var distBetweenNodes=-1;
        var closestPointInSpehere=-1;
        var closestPointVertInSphere, closestPointVert;
        var verts_point=intersection.point;
        var koef=0;
        var aStartVector=-1;
        var aEndVector=-1;
        var possibleSolutions=[];
        var countPossibleSolutions=0;

        for (var _v=0; _v<aLen; _v=findNextNotGroupedPoint(verts, _v)){
            distance=Math.pow(verts[_v].x-verts_point.x,2)+
                    Math.pow(verts[_v].y-verts_point.y,2)+
                    Math.pow(verts[_v].z-verts_point.z,2);

            if (minDistance == -1 || ( distance<minDistance ))  {
                if ( distance>2*radiusSphereImpl*radiusSphereImpl ){/*sqrt(2)*/
                    
                    secClosestPoint=closestPoint;
                    secMinDistance=minDistance;
                    closestPoint=_v;
                    minDistance=distance;
                    possibleSolutions[countPossibleSolutions]={closestPoint:closestPoint, minDistance:minDistance, secClosestPoint:secClosestPoint, secMinDistance:secMinDistance};
                }

            } else if ( minDistance>0 && distance<16*radiusSphereImpl*radiusSphereImpl && distance>minDistance ){
                if (possibleSolutions[countPossibleSolutions]) countPossibleSolutions++;
                minDistance=distance;
                closestPoint=_v;
                secClosestPoint=-1;
                secMinDistance=-1;
            }
        }

        if (minDistance == -1){/*everything in the selection area-as there should be at least something in the minDistance after the end of the loop*/
            var trackPoints=uploaded_splines[name][1];
            var objStart=getPointPositionInChr(trackPoints, 0, verts[0]);
            var objEnd=getPointPositionInChr(trackPoints, objStart.firstPoint, verts[verts.length-1]);

            tempObject.push({start:objStart, end:objEnd});
            
            if (tempObject.length != 0)
                resultSet.push({chr:chr, intervals:tempObject, size:tempObject.length, helix:helix});
            continue;
        }

        for (var tempObj in possibleSolutions){
            minDistance=possibleSolutions[tempObj].minDistance;
            closestPoint=possibleSolutions[tempObj].closestPoint;
            secMinDistance=possibleSolutions[tempObj].secMinDistance;
            secClosestPoint=possibleSolutions[tempObj].secClosestPoint;
            /*for every possible solution-start from null*/
            aStartVector=-1; 
            aEndVector=-1;

            /* set up the secClosestPoint for complete algorithm*/
            if (secClosestPoint == -1){
                if (closestPoint == 0){
                    secClosestPoint=closestPoint;
                    secMinDistance=minDistance;
                    minDistance=-1;
                    for (var indx=findNextNotGroupedPoint(verts, secClosestPoint); indx<aLen; indx=findNextNotGroupedPoint(verts, indx)){
                        distance=Math.pow(verts[indx].x-verts_point.x,2)+
                            Math.pow(verts[indx].y-verts_point.y,2)+
                            Math.pow(verts[indx].z-verts_point.z,2);
                
                        if (minDistance == -1 || ( distance<minDistance && distance>2*radiusSphereImpl*radiusSphereImpl))  {/*sqrt(2)*/
                            closestPoint=indx;
                            minDistance=distance;
                            break;
                        } 
                    }
                    if (minDistance == -1){
                        aEndVector=verts[verts.length-1];
                    } 
                } else{
                    aStartVector=verts[0];
                }
            }

            /*check-if this possible solution is the solution undeed*/
            var nextPoint=-1;
            var nextPointDistance=-1;
            var isThereSomethingInSphere=false;
            /*---secClosestPoint------.?.----closestpoint-----.?.-----nextPoint-------------> (strand ++)*/
            for (var indx=findNextNotGroupedPoint(verts, closestPoint); indx<aLen; indx=findNextNotGroupedPoint(verts, indx)){
                distance=Math.pow(verts[indx].x-verts_point.x,2)+
                    Math.pow(verts[indx].y-verts_point.y,2)+
                    Math.pow(verts[indx].z-verts_point.z,2);
                if ( distance>2*radiusSphereImpl*radiusSphereImpl ){/*sqrt(2)*/
                    nextPoint=indx;
                    nextPointDistance=distance;
                    break;
                } else{
                    isThereSomethingInSphere=true; /*if nextPoint will be found-we shouldn't check anything after-use nextPoint as closestPoint and current closestPoint as secClosestPoint*/
                }
            }

            if (isThereSomethingInSphere){
                secClosestPoint=closestPoint;
                secMinDistance=minDistance;
                closestPoint=nextPoint;
                minDistance=nextPointDistance;
            } else{

                /*check median of the line between two points:if it is located in the radius area*/
                distance=Math.pow((verts[closestPoint].x+verts[nextPoint].x)/2-verts_point.x,2)+
                    Math.pow((verts[closestPoint].y+verts[nextPoint].y)/2-verts_point.y,2)+
                    Math.pow((verts[closestPoint].z+verts[nextPoint].z)/2-verts_point.z,2);

                if ( distance<2*radiusSphereImpl*radiusSphereImpl ){/*sqrt(2)-must be here as corners of cube!!!*/
                    secClosestPoint=closestPoint;
                    secMinDistance=minDistance;
                    closestPoint=nextPoint;
                    minDistance=nextPointDistance;
                } else{

                    distance=Math.pow((verts[closestPoint].x+verts[secClosestPoint].x)/2-verts_point.x,2)+
                        Math.pow((verts[closestPoint].y+verts[secClosestPoint].y)/2-verts_point.y,2)+
                        Math.pow((verts[closestPoint].z+verts[secClosestPoint].z)/2-verts_point.z,2);
                    if ( distance<2*radiusSphereImpl*radiusSphereImpl ){/*sqrt(2)-must be here as corners of cube!!!*/
                        /*everything is ok, let's move on to the next stage*/
                    } else{
                        continue; /* that means that this is pseudo solution with *great probability**/
                    }
                }
            }

            /*DO NOT CHANGE ANYTHING IN THIS BLOCK WITHOUT UNDERSTANDING!!!*/

            /*=======================BEGIN==================*/

            distBetweenNodes=Math.pow(verts[closestPoint].x-verts[secClosestPoint].x, 2)+
                        Math.pow(verts[closestPoint].y-verts[secClosestPoint].y, 2) +
                        Math.pow(verts[closestPoint].z-verts[secClosestPoint].z, 2);
        
            /* 1st case: 2---[---x---]-1       */
            if (findNextNotGroupedPoint(verts,secClosestPoint) != closestPoint ){/*there are points in the sphere area*/
                if (DEBUG) console.log("/* 1st case: 2---[---x---]-1       */");
                if (aStartVector == -1){
                    /*for begins*/
                    closestPointInSpehere=findNextNotGroupedPoint(verts,secClosestPoint);

                    distance=Math.pow(verts[closestPointInSpehere].x-verts_point.x,2)+
                            Math.pow(verts[closestPointInSpehere].y-verts_point.y,2)+
                            Math.pow(verts[closestPointInSpehere].z-verts_point.z,2);

                    distBetweenNodes=Math.pow(verts[secClosestPoint].x-verts[closestPointInSpehere].x, 2)+
                                Math.pow(verts[secClosestPoint].y-verts[closestPointInSpehere].y, 2) +
                                Math.pow(verts[secClosestPoint].z-verts[closestPointInSpehere].z, 2);

                    if (distBetweenNodes>secMinDistance){
                        /*using intersection point*/
                        closestPointVert=verts[secClosestPoint];
                        koef=radiusSphereImpl/Math.sqrt(secMinDistance/2); /*sqrt(2)-as we should cover corners of cube*/
                        aStartVector=new THREE.Vector3(verts_point.x+(closestPointVert.x-verts_point.x)*koef, 
                            verts_point.y+(closestPointVert.y-verts_point.y)*koef, 
                                verts_point.z+(closestPointVert.z-verts_point.z)*koef)
                    } else{
                        /*using intermediate point*/
                        closestPointVert=verts[secClosestPoint];
                        closestPointVertInSphere=verts[closestPointInSpehere];
                        koef=(radiusSphereImpl*Math.sqrt(2)-Math.sqrt(distance)) / Math.sqrt(distBetweenNodes); /*sqrt(2)-as we should cover corners of cube*/
                        aStartVector=new THREE.Vector3(closestPointVertInSphere.x+(closestPointVert.x-closestPointVertInSphere.x)*koef, 
                            closestPointVertInSphere.y+(closestPointVert.y-closestPointVertInSphere.y)*koef, 
                                closestPointVertInSphere.z+(closestPointVert.z-closestPointVertInSphere.z)*koef)
                    }
                }
                
                if (aEndVector == -1){
                    /*for ends*/
                    closestPointInSpehere=findPreviousNotGroupedPoint(verts, closestPoint);

                    distance=Math.pow(verts[closestPointInSpehere].x-verts_point.x,2)+
                            Math.pow(verts[closestPointInSpehere].y-verts_point.y,2)+
                            Math.pow(verts[closestPointInSpehere].z-verts_point.z,2);

                    distBetweenNodes=Math.pow(verts[closestPoint].x-verts[closestPointInSpehere].x, 2)+
                                Math.pow(verts[closestPoint].y-verts[closestPointInSpehere].y, 2) +
                                Math.pow(verts[closestPoint].z-verts[closestPointInSpehere].z, 2);

                    if (distBetweenNodes>minDistance){
                        /*using intersection point*/
                        closestPointVert=verts[closestPoint];
                        koef=radiusSphereImpl/Math.sqrt(minDistance/2); /*sqrt(2)-as we should cover corners of cube*/
                        aEndVector=new THREE.Vector3(verts_point.x+(closestPointVert.x-verts_point.x)*koef, 
                            verts_point.y+(closestPointVert.y-verts_point.y)*koef, 
                                verts_point.z+(closestPointVert.z-verts_point.z)*koef)
                    } else{
                        /*using intermediate point*/
                        closestPointVert=verts[closestPoint];
                        closestPointVertInSphere=verts[closestPointInSpehere];
                        koef=(radiusSphereImpl* Math.sqrt(2)-Math.sqrt(distance)) / Math.sqrt(distBetweenNodes); /*sqrt(2)-as we should cover corners of cube*/
                        aEndVector=new THREE.Vector3(closestPointVertInSphere.x+(closestPointVert.x-closestPointVertInSphere.x)*koef, 
                            closestPointVertInSphere.y+(closestPointVert.y-closestPointVertInSphere.y)*koef, 
                                closestPointVertInSphere.z+(closestPointVert.z-closestPointVertInSphere.z)*koef)
                    }
                }
            } else if ( findNextNotGroupedPoint(verts, secClosestPoint) == closestPoint 
                            && distBetweenNodes>=secMinDistance /*condition-on different sides from interaction point*/ ){/*there are no points in the sphere area*/
                if (aStartVector == -1){
                /*for begins*/
                    /*using intersection point*/
                    closestPointVert=verts[secClosestPoint];
                    koef=radiusSphereImpl/Math.sqrt(secMinDistance / 2); /*sqrt(2)-as we should cover corners of cube*/
                    aStartVector=new THREE.Vector3(verts_point.x+(closestPointVert.x-verts_point.x)*koef, 
                        verts_point.y+(closestPointVert.y-verts_point.y)*koef, 
                            verts_point.z+(closestPointVert.z-verts_point.z)*koef);
                }

                if (aEndVector == -1){
                /*for ends*/
                    /*using intersection point*/
                    closestPointVert=verts[closestPoint];
                    koef=radiusSphereImpl/Math.sqrt(minDistance / 2); /*sqrt(2)-as we should cover corners of cube*/
                    aEndVector=new THREE.Vector3(verts_point.x+(closestPointVert.x-verts_point.x)*koef, 
                        verts_point.y+(closestPointVert.y-verts_point.y)*koef, 
                            verts_point.z+(closestPointVert.z-verts_point.z)*koef);
                }

            } else if (secMinDistance>distBetweenNodes){/* 2nd case: 2--1--[---x---]---    */
                
                if (DEBUG) console.log("/* 2nd case: 2--1--[---x---]---    */");
                if (DEBUG) console.log(secMinDistance+ ">"+distBetweenNodes+" | "+aStartVector+ " | "+ aEndVector+" ["+secClosestPoint+" |||"+closestPoint+"]");
                var tempPoint=findNextNotGroupedPoint(verts, closestPoint);

                distance=Math.pow(verts[tempPoint].x-verts_point.x,2)+
                        Math.pow(verts[tempPoint].y-verts_point.y,2)+
                        Math.pow(verts[tempPoint].z-verts_point.z,2);


                if (distance<2*Math.pow(radiusSphereImpl,2)){
                    /*for begins*/
                    closestPointInSpehere=tempPoint;

                    distBetweenNodes=Math.pow(verts[closestPoint].x-verts[closestPointInSpehere].x, 2)+
                                Math.pow(verts[closestPoint].y-verts[closestPointInSpehere].y, 2) +
                                Math.pow(verts[closestPoint].z-verts[closestPointInSpehere].z, 2);

                    if (aStartVector == -1){
                        if (distBetweenNodes>minDistance){
                            /*using intersection point*/
                            closestPointVert=verts[closestPoint];
                            koef=radiusSphereImpl / Math.sqrt(minDistance/2); /*sqrt(2)-as we should cover corners of cube*/
                            aStartVector=new THREE.Vector3(verts_point.x+(closestPointVert.x-verts_point.x)*koef, 
                                verts_point.y+(closestPointVert.y-verts_point.y)*koef, 
                                    verts_point.z+(closestPointVert.z-verts_point.z)*koef)
                        } else{
                            /*using intermediate point*/
                            closestPointVert=verts[closestPoint];
                            closestPointVertInSphere=verts[closestPointInSpehere];
                            koef=(radiusSphereImpl*Math.sqrt(2)-Math.sqrt(distance)) / Math.sqrt(distBetweenNodes); /*sqrt(2)-as we should cover corners of cube*/
                            aStartVector=new THREE.Vector3(closestPointVertInSphere.x+(closestPointVert.x-closestPointVertInSphere.x)*koef, 
                                closestPointVertInSphere.y+(closestPointVert.y-closestPointVertInSphere.y)*koef, 
                                    closestPointVertInSphere.z+(closestPointVert.z-closestPointVertInSphere.z)*koef)
                        }
                    }

                    /*for ends*/
                    minDistance=-1;
                    for (var indx=findNextNotGroupedPoint(verts, closestPointInSpehere); indx<verts.length; indx=findNextNotGroupedPoint(verts, indx)){
                        distance=Math.pow(verts[indx].x-verts_point.x,2)+
                            Math.pow(verts[indx].y-verts_point.y,2)+
                            Math.pow(verts[indx].z-verts_point.z,2);
                            
                        if (minDistance == -1 || ( distance<minDistance && distance>2*radiusSphereImpl*radiusSphereImpl))  {/*sqrt(2)*/
                            closestPoint=indx;
                            minDistance=distance;
                            break;
                        }
                    }

                    if (closestPoint == -1){
                        aEndVector=verts[aLen-1]
                    } else if (aEndVector == -1){
                        /*for ends*/
                        closestPointInSpehere=findPreviousNotGroupedPoint(verts, closestPoint);

                        distance=Math.pow(verts[closestPointInSpehere].x-verts_point.x,2)+
                                Math.pow(verts[closestPointInSpehere].y-verts_point.y,2)+
                                Math.pow(verts[closestPointInSpehere].z-verts_point.z,2);

                        distBetweenNodes=Math.pow(verts[closestPoint].x-verts[closestPointInSpehere].x, 2)+
                                    Math.pow(verts[closestPoint].y-verts[closestPointInSpehere].y, 2) +
                                    Math.pow(verts[closestPoint].z-verts[closestPointInSpehere].z, 2);

                        if (distBetweenNodes>minDistance){
                            /*using intersection point*/
                            closestPointVert=verts[closestPoint];
                            koef=radiusSphereImpl/Math.sqrt(minDistance/2); /*sqrt(2)-as we should cover corners of cube*/
                            aEndVector=new THREE.Vector3(verts_point.x+(closestPointVert.x-verts_point.x)*koef, 
                                verts_point.y+(closestPointVert.y-verts_point.y)*koef, 
                                    verts_point.z+(closestPointVert.z-verts_point.z)*koef)
                        } else{
                            /*using intermediate point*/
                            closestPointVert=verts[closestPoint];
                            closestPointVertInSphere=verts[closestPointInSpehere];
                            koef=(radiusSphereImpl*Math.sqrt(2)-Math.sqrt(distance)) / Math.sqrt(distBetweenNodes); /*sqrt(2)-as we should cover corners of cube*/
                            aEndVector=new THREE.Vector3(closestPointVertInSphere.x+(closestPointVert.x-closestPointVertInSphere.x)*koef, 
                                closestPointVertInSphere.y+(closestPointVert.y-closestPointVertInSphere.y)*koef, 
                                    closestPointVertInSphere.z+(closestPointVert.z-closestPointVertInSphere.z)*koef)
                        }
                    }
                } else{
                    /*tempPoint-this is the next point out of the sphere*/
                    secClosestPoint=closestPoint;
                    closestPoint=tempPoint;
                    secMinDistance=minDistance;
                    minDistance=distance;
                    if (aStartVector == -1){
                        /*for begins*/
                        /*using intersection point*/
                        closestPointVert=verts[secClosestPoint];
                        koef=radiusSphereImpl/Math.sqrt(secMinDistance/2); /*sqrt(2)-as we should cover corners of cube*/
                        aStartVector=new THREE.Vector3(verts_point.x+(closestPointVert.x-verts_point.x)*koef, 
                            verts_point.y+(closestPointVert.y-verts_point.y)*koef, 
                                verts_point.z+(closestPointVert.z-verts_point.z)*koef);
                    }

                    if (aEndVector == -1){
                        /*for ends*/
                        /*using intersection point*/
                        closestPointVert=verts[closestPoint];
                        koef=radiusSphereImpl/Math.sqrt(minDistance/2); /*sqrt(2)-as we should cover corners of cube*/
                        aEndVector=new THREE.Vector3(verts_point.x+(closestPointVert.x-verts_point.x)*koef, 
                            verts_point.y+(closestPointVert.y-verts_point.y)*koef, 
                                verts_point.z+(closestPointVert.z-verts_point.z)*koef);
                    }
                } 
            }
            var trackPoints=uploaded_splines[name][1];
            var objStart=getPointPositionInChr(trackPoints, 0, aStartVector);
            var objEnd=getPointPositionInChr(trackPoints, objStart.firstPoint, aEndVector);
            
            if (objStart.position == objEnd.position){
                tempObject.push({start:objStart.position-50, end:objEnd.position+50});/*show the minimum block*/
            } else{
                tempObject.push({start:objStart.position, end:objEnd.position});    
            }
/*===============================END=============================*/
        }
        if (tempObject.length != 0)
                resultSet.push({chr:chr, intervals:tempObject, size:tempObject.length, helix:helix});
    }
    return resultSet;
}


function findNextNotGroupedPoint(verts, startPointIndex){
    var epsilon=1+0.01; /*1% to fluctuations*/
    var NEGL_DISTANCE=4*radiusOfTube*radiusOfTube*epsilon; /*based on the tubes width (radiusOfTube*2)*(radiusOfTube*2) */
    var distBetweenNodes=-1;
    for (var _v=startPointIndex+1; _v<verts.length; _v++){
        if (verts[_v] === 'undefined') continue;
            
            distBetweenNodes=Math.pow(verts[startPointIndex].x-verts[_v].x, 2)+
                                Math.pow(verts[startPointIndex].y-verts[_v].y, 2) +
                                Math.pow(verts[startPointIndex].z-verts[_v].z, 2);
            if (distBetweenNodes>NEGL_DISTANCE){
                return _v;
            }
    }
    return verts.length;
}

function findPreviousNotGroupedPoint(verts, startPointIndex){
    var epsilon=1+0.01; /*1% to fluctuations*/
    var NEGL_DISTANCE=4*radiusOfTube*radiusOfTube*epsilon; /*based on the tubes width (radiusOfTube*2)*(radiusOfTube*2)*/
    var distBetweenNodes=-1;
    for (var _v=startPointIndex-1; _v>=0; _v--){
            distBetweenNodes=Math.pow(verts[startPointIndex].x-verts[_v].x, 2)+
                                Math.pow(verts[startPointIndex].y-verts[_v].y, 2) +
                                Math.pow(verts[startPointIndex].z-verts[_v].z, 2);
            if (distBetweenNodes>NEGL_DISTANCE){
                return _v;
            }
    }
    return -1;
}

function getPointPositionInChr(trackPoints, startPointIndex, local_verts_point){
    var verts_point=Local2global(local_verts_point);
    var closestPoint=-1;
    var minDistance=-1;
    var secClosestPoint=-1;
    var secMinDistance=-1;
    var distBetweenNodes=-1;
    for (var pointIndex=startPointIndex; pointIndex<trackPoints.length; ++pointIndex){
        var x=trackPoints[pointIndex][2];
        var y=trackPoints[pointIndex][3];
        var z=trackPoints[pointIndex][4];
        var distance=Math.pow(verts_point.x-x, 2)+
                        Math.pow(verts_point.y-y, 2) +
                        Math.pow(verts_point.z-z, 2);
        if (minDistance == -1 || distance<minDistance){
            if (pointIndex-closestPoint == 1){
                secMinDistance=minDistance;
                secClosestPoint=closestPoint;    
            } else{
                secMinDistance=-1;
                secClosestPoint=-1;
            }
            minDistance=distance;
            closestPoint=pointIndex;
        }
    }
    
    if (secClosestPoint == -1){
        if (closestPoint != startPointIndex){
            secClosestPoint=closestPoint-1;
            secMinDistance=Math.pow(verts_point.x-trackPoints[secClosestPoint][2], 2)+
                        Math.pow(verts_point.y-trackPoints[secClosestPoint][3], 2) +
                        Math.pow(verts_point.z-trackPoints[secClosestPoint][4], 2); 
        } else{
            secClosestPoint=closestPoint;
            secMinDistance=minDistance;
            closestPoint=closestPoint+1;
            minDistance=Math.pow(verts_point.x-trackPoints[secClosestPoint][2], 2)+
                        Math.pow(verts_point.y-trackPoints[secClosestPoint][3], 2) +
                        Math.pow(verts_point.z-trackPoints[secClosestPoint][4], 2); 
        }
    } 

    distBetweenNodes=Math.pow(trackPoints[closestPoint][2]-trackPoints[secClosestPoint][2], 2)+
                        Math.pow(trackPoints[closestPoint][3]-trackPoints[secClosestPoint][3], 2) +
                        Math.pow(trackPoints[closestPoint][4]-trackPoints[secClosestPoint][4], 2);

    if (secMinDistance>=distBetweenNodes){/* v---x------x*/
        closestPoint=closestPoint+1;
        secClosestPoint=secClosestPoint+1;
        secMinDistance=minDistance;
        minDistance=Math.pow(verts_point.x-trackPoints[closestPoint][2], 2)+
                        Math.pow(verts_point.y-trackPoints[closestPoint][3], 2) +
                        Math.pow(verts_point.z-trackPoints[closestPoint][4], 2); 
    }

    /* x----v-----------x*/
/*                return{position:Math.floor((Math.sqrt(secMinDistance)*trackPoints[closestPoint][1]+Math.sqrt(minDistance)*trackPoints[secClosestPoint][1])/(Math.sqrt(secMinDistance)+Math.sqrt(minDistance))), firstPoint:secClosestPoint};*/
    return{position:Math.floor((trackPoints[secClosestPoint][1]*minDistance+trackPoints[closestPoint][1]*secMinDistance) / (minDistance+secMinDistance)), firstPoint:secClosestPoint};
}


function searchOctree(){
    var tempInt=GetIntersection();
    if (tempInt == null) return;
    intersectionImpl=tempInt.point;
    var rayCaster=new THREE.Raycaster( new THREE.Vector3().copy( intersectionImpl ), new THREE.Vector3(0,0,radiusSphere).normalize() );
    var meshesSearch=octree.search( rayCaster.ray.origin, radiusSphere, true, rayCaster.ray.direction ); 
    return getPositionRangeFromCubeIntersection(meshesSearch);
}

function init(){
        Object.size=function(obj){
            var size=0, key;
            for (key in obj){
                if (obj.hasOwnProperty(key)) size++;
            }
            return size;
        };
		scene=new THREE.Scene();
		camera=new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 100000 );
        if (serviceForStructure == "3d"){
            controls=new THREE.PointerLockControls(camera, startPositionOfCamera.x, startPositionOfCamera.y, startPositionOfCamera.z);
        } else{
            controls=new THREE.PointerLockControls(camera) ;
        }
        scene.add( controls.getObject() );
		/* scene.fog=new THREE.Fog( 0xffffff, 0, blockSize*scaleFactor );*/
		init_light(scene);    
        renderer=new THREE.WebGLRenderer();
        renderer.setClearColor( 0xffffff );
        var left_padding=28.5;
        var top_padding=(($("ul.ui-tabs-nav").height() != null) ? $("ul.ui-tabs-nav").height()+27:70);
        renderer.setSize( window.innerWidth-left_padding*2, window.innerHeight-top_padding );
        InitSelectionMesh();
        InitTargetBall();
        /* create octree*/
        octree=new THREE.Octree({
          undeferred:false,
          depthMax:Infinity,
          objectsThreshold:8,
          overlapPct:0.15
        } );
        divElement=document.getElementById("tabs-1");
        divElement.appendChild( renderer.domElement );
        window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize(){
        camera.aspect=window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        var left_padding=28.5;
        var top_padding=(($("ul.ui-tabs-nav").height() != null) ? $("ul.ui-tabs-nav").height()+27:70);
        renderer.setSize( window.innerWidth-left_padding*2, window.innerHeight-top_padding );
        keys_block_management(true);
        document.getElementById("blocker").style.top=String($("ul.ui-tabs-nav").height()+27)+"px";
        if (typeof $("div#detection-sign").style != 'undefined')
            $("div#detection-sign").style.bottom=String(infoBlock.clientHeight)+"px";
}

function appendStringAsNodes(element, html){
    var frag=document.createDocumentFragment(),
        tmp=document.createElement('body'), child;
    tmp.innerHTML=html;
    while (child=tmp.firstChild){
        frag.appendChild(child);
    }
    element.appendChild(frag);
    frag=tmp=null;
}

/*generate fake genotype-should be deleted after appearence of the real data!!!*/
function getFakeGenotypeForSNP(){
    var text="";
    var possible="ACGT";
    for( var i=0; i<2; i++ )
        text += possible.charAt(Math.floor(Math.random()*possible.length));
    
    return text;
}

function reverseLine(s){
    return s.split("").reverse().join("");
}

function Local2global(coordinates){
	return{x:zeroCoordinate.x+coordinates.x / scaleFactor, 
		    y:zeroCoordinate.y+coordinates.y / scaleFactor, 
		    z:zeroCoordinate.z+coordinates.z / scaleFactor };
}
function Global2local(coordinates){
	return{x:(coordinates.x-zeroCoordinate.x)*scaleFactor, 
		    y:(coordinates.y-zeroCoordinate.y)*scaleFactor, 
		    z:(coordinates.z-zeroCoordinate.z)*scaleFactor };
}    

function Local2globalVector3(coordinates){
    return new THREE.Vector3(zeroCoordinate.x+coordinates.x / scaleFactor, zeroCoordinate.y+coordinates.y / scaleFactor, zeroCoordinate.z+coordinates.z / scaleFactor);
}

function Global2localVector3(coordinates){
    return new THREE.Vector3((coordinates.x-zeroCoordinate.x)*scaleFactor, (coordinates.y-zeroCoordinate.y)*scaleFactor, (coordinates.z-zeroCoordinate.z)*scaleFactor);
}

function GenerateColor(){
	mix=[0.8, 0.8, 0.8];
    var red=Math.random();
    var green=Math.random();
    var blue=Math.random();
    /* mix the color*/
    red=(red+mix[0]) / 2;
    green=(green+mix[1]) / 2;
    blue=(blue+mix[2]) / 2;
    return new THREE.Color().setRGB(red, green, blue);
}

function DrawSNPs(positions, track_points){
	var track_points_position=0;
	for (var point_index=0; point_index<positions.length; ++point_index){
		var base_index=positions[point_index][0];
		var snp_id=String(positions[point_index][1]);
		while (track_points_position<track_points.length && track_points[track_points_position][1]<= base_index){
			++track_points_position;
		}
		if (track_points_position>0 && track_points_position<track_points.length){
			var prev_base_index=track_points[track_points_position-1][1];
			var curr_base_index=track_points[track_points_position][1];
			var coefficient=(base_index-prev_base_index) / (curr_base_index-prev_base_index);
			var x=(1-coefficient)*track_points[track_points_position-1][2]+coefficient*track_points[track_points_position][2];
			var y=(1-coefficient)*track_points[track_points_position-1][3]+coefficient*track_points[track_points_position][3];
			var z=(1-coefficient)*track_points[track_points_position-1][4]+coefficient*track_points[track_points_position][4];
			var localCoords=Global2local({x:x, y:y, z:z });
        	var sphere=new THREE.SphereGeometry(12, 10, 10);
        	var snp_ball=new THREE.Mesh(sphere, new THREE.LineBasicMaterial({color:0xff0000}));
			snp_ball.name="rs"+snp_id;            	
			snp_ball.position.set(localCoords.x,  localCoords.y, localCoords.z);
			scene.add(snp_ball);
		}
	}
}

function UploadRegionSNP(chr, track_points){
	var request="chr="+((chr==='23')?'X':chr)+"&start="+String(Math.floor(track_points[0][1])) +
					 "&end="+String(Math.floor(track_points[track_points.length-1][1])); 
    var url="http://1kgenome.exascale.info/js_snp?"+request;
    $.getJSON(url+"?callback=?", null, 
    	function(positions){
    		DrawSNPs(positions, track_points);
    	}
    ); 	
}

function UploadSNP(new_model_points){
	var new_tracks=new_model_points["data"];
	var longest=-1;
	var length=0;
	for (var track_index=0; track_index<new_tracks.length; ++track_index){
		var track_points=new_tracks[track_index][1];
		if (track_points.length>length){
			longest=track_index;
			length=track_points.length;
		}
	}
	for (var track_index=longest; track_index<longest+1; ++track_index){
		var chrid=new_tracks[track_index][0];
		var chridNoStrand=chrid.substr(0, chrid.length-2);
		var chridOnlyNumber=chridNoStrand;
		if (chridOnlyNumber[chridOnlyNumber.length-1] == "a"){
			chridOnlyNumber=chridOnlyNumber.substr(0, chridOnlyNumber.length-1);
		}
		var track_points=new_tracks[track_index][1];
		UploadRegionSNP(chridOnlyNumber, track_points);
	}
}
            

function DrawPoints(model_points, blockIndicesStr, blockIndices){
    var isEven=true;
	new_tracks=model_points["data"];
	for (var track_index=0; track_index<new_tracks.length; ++track_index){
		chrid=new_tracks[track_index][0];
        chridNoStrand=chrid.split('_')[0];
        var chridOnlyNum=chrid.replace(/([\d]+).*/, "$1");
        var ifCentralPartSkipped=false;
		if (!chrid2color[chridNoStrand]){
			/*chrid2color[chridNoStrand]=new THREE.Color().setHSL( Math.random(),  Math.random(),  Math.random());*/
			chrid2color[chridNoStrand]=GenerateColor();
		}
		track_points=new_tracks[track_index][1];
        var temp_name=chrid+"-"+String(track_points[0][1])+"-" +String(track_points[track_points.length-1][1]);
        if (uploaded_splines[temp_name]) continue; /*That is the object which is exactly the same that already exists-it can happen because of our rare data*/
        if (track_points.length == 2){
            ifCentralPartSkipped=true;
        }

		var tube_color=chrid2color[chridNoStrand];
        var material, material_extention;

        var materials=[new THREE.MeshLambertMaterial({color:tube_color, shading:THREE.SmoothShading } ), new THREE.MeshBasicMaterial({color:tube_color, shading:THREE.SmoothShading, transparent:true } )];
        var p1, p2;
        var geometry_ext1, geometry_ext2, geometry_ext1_track_point, geometry_ext2_track_point;
        if (track_points.length>1){
            p1=track_points[0];
            p2=track_points[1];
            geometry_ext1_track_point=((serviceForStructure=='3d')?createApproximatedTrackPoints([p1, p2]):[p1,p2])
            geometry_ext1=createAStrandEndGeometry(geometry_ext1_track_point, false);

            p1=track_points[track_points.length-2];
            p2=track_points[track_points.length-1];
            geometry_ext2_track_point=((serviceForStructure=='3d')?createApproximatedTrackPoints([p1, p2]):[p1,p2])
            geometry_ext2=createAStrandEndGeometry(geometry_ext2_track_point, false);
        } else{
            continue;
        }
        /* var approx_track_point=track_points;*/

        var approx_track_point;
        var tube,radiusSegments,segments,spline;
        var lastChinkPosition, spline_points, points_count;
        if (!ifCentralPartSkipped){
            approx_track_point=track_points.slice(1, track_points.length-1);
            if ( serviceForStructure == '3d' ){
                approx_track_point=createApproximatedTrackPoints(track_points.slice(1, -1));
            }
			spline_points=[];
			points_count=approx_track_point.length;
            
            if (points_count<=1) continue;
			for (var point_index=0; point_index<points_count; ++point_index){
				var chunk=approx_track_point[point_index];
                
				var localCorodinates=Global2local({x:chunk[2], y:chunk[3], z:chunk[4] });						
				spline_points.push(new THREE.Vector3(localCorodinates.x, localCorodinates.y, localCorodinates.z));
			}
            spline=new THREE.SplineCurve3(spline_points);
            segments=points_count*2;
            radiusSegments= 6;
            tube=new THREE.TubeGeometry(spline, segments, radiusOfTube,    radiusSegments, false, false);
            tube.dynamic=true;
        } else{
            approx_track_point=geometry_ext1_track_point.slice(0,-1).concat(geometry_ext2_track_point)
        }
        if (typeof meter == 'undefined'){
            if (serviceForStructure == '3d'){
                meter=parseInt(approx_track_point[approx_track_point.length-1][1]-approx_track_point[0][1])/approx_track_point.length;
                if (healthness === 'm=leukemia'){

                    basesInSelection=meter;
                    minMeter=meter / 5 ; maxMeter=Math.min(meter*5, 90000); stepScroll=meter / 5;    
                } else{
                    basesInSelection=meter/2;
                    minMeter=meter / 10 ; maxMeter=meter*2; stepScroll=meter / 10;    
                }
            } else{
                meter=basesInSelection;
                minMeter=100 ; maxMeter=3000; stepScroll=100;
            }
        }
        var total_geom=new THREE.Geometry();
        total_geom.merge(geometry_ext1, undefined, 1);
        if (!ifCentralPartSkipped){
            total_geom.merge(tube, undefined, 0);    
        }
        total_geom.merge(geometry_ext2, undefined, 1);
        var tubeMesh=new THREE.Mesh(total_geom, new THREE.MeshFaceMaterial(materials));
        tubeMesh.userData=[blockIndicesStr, blockIndices];
		tubeMesh.name=temp_name;/*chrid+"-"+String(track_points[0][1])+"-" +String(track_points[track_points.length-1][1]);*/

        if (!ifCentralPartSkipped){
            approx_track_point=geometry_ext1_track_point.concat(approx_track_point.slice(1,-1)).concat(geometry_ext2_track_point);
        } 

        if (isCustomerData && typeof customerData != 'undefined'){
            var arr=AdaptUploadedSpinesForCustomerData(approx_track_point[0][1], approx_track_point[approx_track_point.length-1][1], chridOnlyNum);
            uploaded_splines[tubeMesh.name]=[chrid, approx_track_point, arr[0], arr[1], chridOnlyNum];/*in usual case-as before*/
        } else{
            uploaded_splines[tubeMesh.name]=[chrid, approx_track_point];/*in usual case-as before*/
        }
        
		if (serviceForStructure == '3d') 
            octree.add(tubeMesh,{useFaces:false, useVertices:true, useSeqVertices:false});
        else octree.add(tubeMesh,{useFaces:false, useVertices:false, useSeqVertices:true});

        scene.add(tubeMesh);
		objects.push(tubeMesh);
        
        if (DEBUG) console.log('Hi')
	}
    draw_tube_response_counter++;
}
function createApproximatedTrackPoints(track_points){
    function Interpolate2(point, otherPoint, bpIndexNeed){
        var bpIndex=point[1];
        var bpIndexOther=otherPoint[1];
        var coeff=(bpIndexNeed-bpIndex) / (bpIndexOther-bpIndex);
        var xCoord=point[2]+(otherPoint[2]-point[2])*coeff;
        var yCoord=point[3]+(otherPoint[3]-point[3])*coeff;
        var zCoord=point[4]+(otherPoint[4]-point[4])*coeff;
        return{x:xCoord, y:yCoord, z:zCoord};
    }

    var result=[];
    
    var points_count=track_points.length;
    var rate;
    result[0]=track_points[0];
    var tempObj, previousLastTempObj;
    for (var indx=0; indx< points_count-1; indx++){
        rate=parseInt((track_points[indx+1][1]-track_points[indx][1])/NUMBER_LIMIT);
        if (rate<2){
            result.push(track_points[indx+1]);
            continue;
        }
        for (var i=1; i<=rate; i++){
            bpIndexNeed=Math.floor(track_points[indx][1]+i/rate* (track_points[indx+1][1]-track_points[indx][1]));
            /*linear interpolation*/
            tempObj=Interpolate2(track_points[indx], track_points[indx+1], bpIndexNeed);
            result.push([track_points[indx][0], bpIndexNeed, tempObj.x, tempObj.y, tempObj.z]);
        }
        /* result.push(track_points[indx+1]);*/
    }
    return result;
}

function createApproximatedTrackPoints1(track_points, spline){
    var result=[];
    var track_points_len=track_points.length;
    var points_count=spline.length;
    var globalVar;
    var start_point=0;
    var distance, distance_between_nodes;
    var normal_counter=0;
    
    for (var indx=0; indx< points_count; indx=findNextNotGroupedPoint(spline, indx)){
        globalVar=Local2globalVector3(spline[indx]);
        if (indx == 0){
            result[normal_counter]=track_points[0];
        }

        for (var indx2=start_point; indx2<track_points_len-1/*because of decrease*/; indx2++){
            distance=Math.pow(track_points[indx2][2]-globalVar.x,2)+
                    Math.pow(track_points[indx2][3]-globalVar.y,2)+
                    Math.pow(track_points[indx2][4]-globalVar.z,2);

            distance_between_nodes=Math.pow(track_points[indx2][2]-track_points[indx2+1][2],2)+
                    Math.pow(track_points[indx2][3]-track_points[indx2+1][3],2)+
                    Math.pow(track_points[indx2][4]-track_points[indx2+1][4],2);

            if ( distance_between_nodes>=distance ){
                result[normal_counter]=[track_points[indx2][0], Math.floor(track_points[indx2][1]+(track_points[indx2+1][1]-track_points[indx2][1])*distance / distance_between_nodes), globalVar.x, globalVar.y, globalVar.z];
                break;
            } else{
                start_point++;
                continue;
            }
        }
        normal_counter++;
    }
    
    return result;
}

function AdaptUploadedSpinesForCustomerData(beginPos, endPos, chridOnlyNum){
    var customerDataStart=-1, customerDataEnd=-1;
    {  
        var custArray=customerData[chridOnlyNum];
        var lenCustomerData=custArray.length;
        for (var point_index=0; point_index<lenCustomerData; ++point_index){
            if (customerDataStart==-1 && custArray[point_index][0]>beginPos){
                customerDataStart=point_index;
            } else if (customerDataStart!=-1 && customerDataEnd==-1 && custArray[point_index][0]>endPos){
                customerDataEnd=point_index-1;
                return [customerDataStart, customerDataEnd];
            }
        }
    }
}

function DrawBox(cornerModelCoordinates, edgeSize){
   var vertices=[];
   for (var pointIndex=0; pointIndex<8; ++pointIndex){
       var xCoord=cornerModelCoordinates.x+edgeSize*(pointIndex % 2);
       var yCoord=cornerModelCoordinates.y+edgeSize*((pointIndex >> 1) % 2);
       var zCoord=cornerModelCoordinates.z+edgeSize*((pointIndex >> 2) % 2);
       vertexLocalCoordinates=Global2local({x:xCoord, y:yCoord, z:zCoord });
       vertices[pointIndex]=new THREE.Vector3(vertexLocalCoordinates.x, vertexLocalCoordinates.y, vertexLocalCoordinates.z);
   }
   for (var firstIndex=0; firstIndex<vertices.length; ++firstIndex){
       for (var secondIndex=firstIndex+1; secondIndex<vertices.length; ++secondIndex){
           var matchedCoordinates=((firstIndex % 2) == (secondIndex % 2)) ? 1:0;
           matchedCoordinates += ((firstIndex >> 1) % 2 == (secondIndex >> 1) % 2) ? 1:0;
           matchedCoordinates += ((firstIndex >> 2) % 2 == (secondIndex >> 2) % 2) ? 1:0;
           if (matchedCoordinates == 2){
			   var material=new THREE.LineBasicMaterial({color:0x0000af});
			   var geometry=new THREE.Geometry();
			   geometry.vertices.push(vertices[firstIndex]);
			   geometry.vertices.push(vertices[secondIndex]);	               	
			   var line=new THREE.Line(geometry, material);
               boxLines.push(line);
			   if (isDrawingBox) scene.add(line);
           }
       }           
   }      
}

function UploadPoints(blockCornerCoordinates, blockIndicesStr, blockIndices){
    if (serviceForStructure == "3d")
        overlap=blockSize*0.25;
    else
        overlap=blockSize*0.2;
    
	var request="xstart="+String(blockCornerCoordinates.x-overlap) 
				 +"&xend="+String(blockCornerCoordinates.x+blockSize+overlap)
				 +"&zstart="+String(blockCornerCoordinates.z-overlap)      
				 +"&zend="+String(blockCornerCoordinates.z+blockSize+overlap)  
				 +"&ystart="+String(blockCornerCoordinates.y-overlap)      
				 +"&yend="+String(blockCornerCoordinates.y+blockSize+overlap);
    var url="http://1kgenome.exascale.info/"+serviceForStructure+"?"+disease3Dexpression+request;
    draw_tube_request_counter++;
    $.getJSON(url+"?callback=?", null, 
    	function(model_points){
    		DrawPoints(model_points, blockIndicesStr, blockIndices);
            hideInProgressSymbol();
    	}
    ).fail(function(){showErrorAlertModalWindow('Service is not available at this moment. We are doing all the best to fix it now. Please, try again later.','Service is not available at this moment. We are doing all the best to fix it now. Please, try again later.'); draw_tube_response_counter++;});
}

function GetBlockIndices(modelPosition){
	blockOffset=blockSize / 2;
    var blockIndexX=Math.floor((modelPosition.x+blockOffset) / blockSize);
    var blockIndexY=Math.floor((modelPosition.y+blockOffset) / blockSize);
    var blockIndexZ=Math.floor((modelPosition.z+blockOffset) / blockSize);   
    return{x:blockIndexX, y:blockIndexY, z:blockIndexZ };
}

function GetBlockCornerCoordinates(blockIndices){
	blockOffset=blockSize / 2;
	var xCoord=blockIndices.x*blockSize-blockOffset;
	var yCoord=blockIndices.y*blockSize-blockOffset;
	var zCoord=blockIndices.z*blockSize-blockOffset;
	return{x:xCoord, y:yCoord, z:zCoord};
}

function Coords2Str(coordinates){
    return String(coordinates.x)+":"+String(coordinates.y)+":"+String(coordinates.z);
}

function Str2Coords(coorLine){
    var arr=coorLine.split(':');
    return{x:parseInt(arr[0]), y:parseInt(arr[1]), z:parseInt(arr[2]) };
}

function UpdateModel(){
	var modelPosition=Local2global(controls.getObject().position);
	var blockIndices=GetBlockIndices(modelPosition);
	var blockIndicesStr=Coords2Str(blockIndices);
    var isDifferentCube=(lastBlockIndicesStr != blockIndicesStr);
    /*delete textures in the others cube only if */
    if (isDifferentCube){
        /*immediate cleaning the octree-recreate everytime you left the cube*/
        if (isOneCubeOctree){
            octree=new THREE.Octree({
              undeferred:false,
              depthMax:Infinity,
              objectsThreshold:8,
              overlapPct:0.15
            } );
            if (uploaded_area[blockIndicesStr]){

                var objArray=$.grep(objects, function(v,i){return v.userData[0] === blockIndicesStr});
                
                for (var _o in objArray){
                    if (serviceForStructure == '3d') 
                        octree.add(objArray[_o],{useFaces:false, useVertices:true, useSeqVertices:false});
                    else octree.add(objArray[_o],{useFaces:false, useVertices:false, useSeqVertices:true});
                }
            }
        }
        DeleteTexturesFromCubes(blockIndicesStr, blockIndices);
        lastBlockIndicesStr=blockIndicesStr;
    }
	
    if (uploaded_area[blockIndicesStr]){
	} else{
        popupInProgressSymbol();
        var blockCornerCoordinates=GetBlockCornerCoordinates(blockIndices);
        if (typeof uploaded_area[blockIndicesStr] == 'undefined') DrawBox(blockCornerCoordinates, blockSize); /*Don't draw everytime*/
        uploaded_area[blockIndicesStr]=true;
        draw_tube_response_counter=0, draw_tube_request_counter=0;
        UploadPoints(blockCornerCoordinates, blockIndicesStr, blockIndices);
    }
    if (isDifferentCube){
        checkIncompleteColoredGene();
        isDifferentCube=false;
    }
    if (geneDrawQueue && geneDrawQueue.length!=0){
        
        geneDrawQueueLength=geneDrawQueue.length;
        for (var i=geneDrawQueueLength-1; i >=0; i--){/*in descent as we have to rebuild the index for geneDrawQueue object*/
             DrawGeneRunner(i,blockIndicesStr);
        }
    }
}

function checkIncompleteColoredGene(){
    var tempArr;
    for (var _gene in geneObjects){
        if (!geneObjects[_gene].userData[0]){
            tempArr=geneObjects[_gene].name.split("-");
            geneDrawQueue.push([tempArr[0], tempArr[1].toLowerCase(), false]);
        }
    }
}

function GetVerticesCut(_obj, geneObjStart, geneObjEnd, isVertUse){
    var vertices=objects[_obj].geometry.vertices;
    var vert_cut=[], spline_points=[];;
    var vert_cut_sup=[];
    var beginEndArray=getApproximationForVerticesBeginEndPosition(vertices, uploaded_splines[objects[_obj].name][1], 0, 1, geneObjStart, geneObjEnd, isVertUse);

    if (isVertUse){
        if ((beginEndArray[1]-beginEndArray[0] == 1) && (beginEndArray[4] && beginEndArray[5])){
            vert_cut_sup.push(beginEndArray[4]);
            vert_cut_sup.push(beginEndArray[5]);
        } else if ((beginEndArray[1]-beginEndArray[0]>1) && (beginEndArray[4] && beginEndArray[5])){
            vert_cut=uploaded_splines[objects[_obj].name][1].slice(beginEndArray[0]+1, beginEndArray[1]);
            vert_cut_sup.push(beginEndArray[4]);
            vert_cut_sup.push(beginEndArray[5]);
        } else if ((beginEndArray[1]-beginEndArray[0]>1)){
            vert_cut=uploaded_splines[objects[_obj].name][1].slice(beginEndArray[0], beginEndArray[1]+1);
        } else{
            return [];
        }

        /*have to provide local coordintes*/
        for (var point_index=0, points_count=vert_cut.length; point_index<points_count; ++point_index){
            var chunk=vert_cut[point_index];
            var localCorodinates=Global2local({x:chunk[2], y:chunk[3], z:chunk[4]});                        
            spline_points.push(new THREE.Vector3(localCorodinates.x, localCorodinates.y, localCorodinates.z));
        }
        if (vert_cut_sup.length>1){
            spline_points.splice(0, 0, vert_cut_sup[0]);
            spline_points.push(vert_cut_sup[1]);
        }
        return spline_points;
    } else{
        var beginningGeneVert=findPreviousNotGroupedPoint(vertices, beginEndArray[0]); /*actual end of previous segment for beginning of gene strand (if it is not 0)*/
        var endGeneVert=findNextNotGroupedPoint(vertices, beginEndArray[1]); /*actual beginning of next segment after end of gene strand (if it is not last)*/
        vert_cut=vertices.slice(((beginningGeneVert!=0)?beginningGeneVert+1:0), endGeneVert-1);
        vert_cut=getNormalizedVerticesForVertCut(vert_cut);    
    }
    return vert_cut;
}

function DrawGeneRunner(index, blockIndicesStr){
    var tempArr;
    var geneObj, geneObjStart, geneObjEnd;
    geneObj=geneDrawQueue[index];
    for (var _obj in objects){
        if (!objects[_obj].name || objects[_obj].userData[0] != blockIndicesStr) continue;
        tempArr=objects[_obj].name.split('-');
        var chridNoStrand=tempArr[0].split('_')[0];
        var chridOnlyNumber=chridNoStrand.replace(/([\dXYxy]+).*/,"$1");
        if (geneDrawQueue[index] && chridOnlyNumber == geneDrawQueue[index][0]){
            
            geneObjStart=genedata[geneObj[0]][geneObj[1]][1];
            geneObjEnd=genedata[geneObj[0]][geneObj[1]][2];
            if ( (geneObjStart>parseInt(tempArr[1]) && geneObjEnd<parseInt(tempArr[2])) ){/*full cover*/
                var vert_cut=GetVerticesCut(_obj, geneObjStart, geneObjEnd, true);
                if (uploaded_splines_genes[geneObj[0]+"-"+geneObj[1]] && !geneObj[2]){
                    DeleteGene(geneObj[0], geneObj[1], null, true);
                }
                DrawGeneOverTheTube(vert_cut, geneObj, true);
                geneDrawQueue.splice(index, 1);
                return;
            } else if (geneObjStart>parseInt(tempArr[1]) && geneObjStart<parseInt(tempArr[2])){
                var vert_cut=GetVerticesCut(_obj, geneObjStart, parseInt(tempArr[2]), true);
                if (uploaded_splines_genes[geneObj[0]+"-"+geneObj[1]] && !geneObj[2]){
                    DeleteGene(geneObj[0], geneObj[1], null, true);
                }
                DrawGeneOverTheTube(vert_cut, geneObj, false);
                geneDrawQueue.splice(index, 1);
                return;
                /*from geneObjStart to parseInt(tempArr[2])-right intersection*/
            } else if (geneObjEnd>parseInt(tempArr[1]) && geneObjEnd<parseInt(tempArr[2])){
                var vert_cut=GetVerticesCut(_obj, parseInt(tempArr[1]), geneObjEnd, true);
                if (uploaded_splines_genes[geneObj[0]+"-"+geneObj[1]] && !geneObj[2]){
                    DeleteGene(geneObj[0], geneObj[1], null, true);
                }
                DrawGeneOverTheTube(vert_cut, geneObj, false);
                geneDrawQueue.splice(index, 1);
                return;
                /*from parseInt(tempArr[1]) to geneObjEnd-left intersection*/
            } else if (geneObjStart<parseInt(tempArr[1]) && geneObjEnd>parseInt(tempArr[2])){
                var vert_cut=GetVerticesCut(_obj, parseInt(tempArr[1]), parseInt(tempArr[2]), true);
                if (uploaded_splines_genes[geneObj[0]+"-"+geneObj[1]] && !geneObj[2]){
                    DeleteGene(geneObj[0], geneObj[1], null, true);
                }
                DrawGeneOverTheTube(vert_cut, geneObj, false);
                geneDrawQueue.splice(index, 1);
                return;
                /* from parseInt(tempArr[1]) to parseInt(tempArr[2])-gene overlaps line interval*/
            } else{
                continue;
            }
        }
    }
    if (uploaded_splines_genes[geneObj[0]+"-"+geneObj[1]] && draw_tube_response_counter == draw_tube_request_counter){
        geneDrawQueue.splice(index, 1); /*can't color this gene*/
    }
}

function DeleteAllGenes(){
    for (var i=geneObjects.length-1; i>=0; i--){
        DeleteGene(null, null, i);
    }
}

function DeleteGene(_chr, _gene, index, isPartitionDel){
    var nameToDelete;
    if (!index){
        nameToDelete=_chr+"-"+genedata[_chr][_gene][4];
        index=-1;
        for (var _geneObj in geneObjects){
            if (geneObjects[_geneObj].name == nameToDelete){
                index=_geneObj;
                break;
            }
        }
    } else{
        nameToDelete=geneObjects[index];
    }

    if (index != -1){
        scene.remove(geneObjects[index]);
        geneObjects.splice(index,1);
    }
    if (!isPartitionDel) delete uploaded_splines_genes[nameToDelete.toLowerCase()];
}

/* get full part of vertices that should be simplified and @returns central points around which we can buld tube or any other mesh*/
function getNormalizedVerticesForVertCut(vert_cut){
    var splines=[];
    var lastSegmentPoint=0, opposite4LastSgmentPointMath=0;
    for (var i=0; i<vert_cut.length; i=findNextNotGroupedPoint(vert_cut,i)){
        lastSegmentPoint=findNextNotGroupedPoint(vert_cut,i)-1;
        opposite4LastSgmentPointMath=Math.floor((lastSegmentPoint+i)/2);
        if ((lastSegmentPoint+i)%2 == 0){
            splines.push(new THREE.Vector3(
                (vert_cut[i].x+2*vert_cut[opposite4LastSgmentPointMath].x+vert_cut[lastSegmentPoint].x )/4,
                (vert_cut[i].y+2*vert_cut[opposite4LastSgmentPointMath].y+vert_cut[lastSegmentPoint].y )/4,
                (vert_cut[i].z+2*vert_cut[opposite4LastSgmentPointMath].z+vert_cut[lastSegmentPoint].z )/4));
        } else{
            splines.push(new THREE.Vector3(
                (vert_cut[opposite4LastSgmentPointMath].x+vert_cut[lastSegmentPoint].x )/2,
                (vert_cut[opposite4LastSgmentPointMath].y+vert_cut[lastSegmentPoint].y )/2,
                (vert_cut[opposite4LastSgmentPointMath].z+vert_cut[lastSegmentPoint].z )/2));
        }
    }
    return splines;
}

function DrawGeneOverTheTube(vert_cut, geneObject, isComplete){
    var tube_color=getColorForPercentage(Math.log(genedata[geneObject[0]][geneObject[1]][3])/ Math.log(33093.3057));/*math*/
    var material=new THREE.MeshPhongMaterial({
        shading:THREE.SmoothShading, 
        side:THREE.DoubleSide,
        color:tube_color,
        ambient:tube_color,
        specular:0x050505,
        shininess:100
    } ) 
    if (DEBUG) console.log("draw gene "+geneObject[0]+"-"+geneObject[1]+"|||"+vert_cut.length)
    var spline=new THREE.SplineCurve3(vert_cut);

    var segments=vert_cut.length;
    var radiusSegments=6;
    var tube=new THREE.TubeGeometry( spline, segments, radiusOfTube*2, radiusSegments, false, false);
    tube.dynamic=true;
    var tubeMesh=new THREE.Mesh(tube, material);
    tubeMesh.userData=[isComplete];
    tubeMesh.name=geneObject[0]+"-"+genedata[geneObject[0]][geneObject[1]][4];
    if (!uploaded_splines_genes[tubeMesh.name.toLowerCase()])
        uploaded_splines_genes[tubeMesh.name.toLowerCase()]=genedata[geneObject[0]][geneObject[1]];
    scene.add(tubeMesh);
    geneObjects.push(tubeMesh);
}

/*Delete Mesh out of the alowed space region*/
function DeleteTexturesFromCubes(blockIndicesStr, blockIndices){
    var objectsIndcesToDelete=[];
    var tempUserData, tempUserDataCoord;
    var distanceToDelete=1;
    /*for (var _obj in objects){*/
    if (DEBUG) console.log("Delete started");
    var userDataArray={};
    for (var _obj=objects.length-1; _obj>=0; --_obj){
        tempUserData=objects[_obj].userData[0];
        tempUserDataCoord=objects[_obj].userData[1];
        if (tempUserData != blockIndicesStr && !(blockIndices.x-tempUserDataCoord.x<=distanceToDelete && blockIndices.x-tempUserDataCoord.x>=(-1*distanceToDelete) && blockIndices.y-tempUserDataCoord.y<=distanceToDelete && blockIndices.y-tempUserDataCoord.y>=(-1*distanceToDelete) && blockIndices.z-tempUserDataCoord.z<=distanceToDelete && blockIndices.z-tempUserDataCoord.z>=(-1*distanceToDelete))){
            userDataArray[tempUserData]=true;
            uploaded_area[tempUserData]=false;
            scene.remove(objects[_obj]);
            delete uploaded_splines[objects[_obj].name];
            if (!isOneCubeOctree) octree.remove(objects[_obj]);
            objects.splice(_obj, 1);
        }
    }

    for (var _obj=chipObjects.length-1; _obj>=0 ; --_obj){
            tempUserData=chipObjects[_obj].userData[0];
            tempUserDataCoord=chipObjects[_obj].userData[1];
            if (userDataArray[tempUserData]){   
                if (DEBUG) console.log(tempUserData);
                if (tempUserData in chipSecCubes) delete chipSecCubes[tempUserData];
                uploaded_area[tempUserData]=false;
                scene.remove(chipObjects[_obj]);
                delete uploaded_splines_chip[chipObjects[_obj].name];
                chipObjects.splice(_obj, 1);
            }
    }
}

function createAndDrawStrandEndImpl(p0, p1, p2, blockIndicesStr, isFirst, _name){
    var mesh=createAndDrawStrandEnd(p0, p1, p2, blockIndicesStr, isFirst, _name);
    scene.add(mesh);
    return mesh;
}

function createAndDrawStrandEnd(p0, p1, p2, blockIndicesStr, isFirst, _name){
    var spline=new THREE.SplineCurve3([Global2localVector3({x:p1[2], y:p1[3], z:p1[4]}), Global2localVector3({x:p0[2], y:p0[3], z:p0[4]})]);
    var material=new THREE.MeshBasicMaterial({
        color:0x0000ff,
        opacity:1,
        wireframe:true,
        transparent:false
    }); 
    var segments=5;
    var radiusSegments=5;
    var tube=new THREE.TubeGeometry(spline, segments, radiusOfTube, radiusSegments, false, false);
    tube.dynamic=true;
    var mesh=new THREE.Mesh(tube, material);
    mesh.name=_name+((isFirst)?"_1":"_2");
    mesh.userData=blockIndicesStr;
    if (!tube_continuation_map[blockIndicesStr]){
       tube_continuation_map[blockIndicesStr]=[];
    } 
    tube_continuation_map[blockIndicesStr].push([mesh,_name,isFirst]); /*link to the object for notification of removal, isBegin*/
    return mesh;
}

function createAStrandEndGeometry(point_set, isVector3Set){
    var spline_points=[];
    if (!isVector3Set){
        for (var _p in point_set){
            spline_points.push(Global2localVector3({x:point_set[_p][2], y:point_set[_p][3], z:point_set[_p][4]}))
        }
    } else{
        spline_points=point_set;
    }
    var spline=new THREE.SplineCurve3(spline_points);
    var segments=5;
    var radiusSegments=5;
    var tube=new THREE.TubeGeometry(spline, segments, 0.85*radiusOfTube, radiusSegments, false, false);
    tube.dynamic=true;
    return tube;
}

function GetIntersectionCHIPSEQ(){
    var vector=new THREE.Vector3(0, 0, 0);
    vector.unproject( camera );
    var camera_pos=controls.getObject().position;
    var raycaster=new THREE.Raycaster(camera_pos, vector.sub( camera_pos ).normalize());/*THREE.js v69*/

    var closestObjectDistance;
    var intersects=raycaster.intersectObjects(chipObjects);
    if (intersects.length == 0){
        return null;
    }
    closestObjectDistance=intersects[0].distance;
    intersects=$.grep(intersects, function(v){return v.distance<=closestObjectDistance+radiusOfTube/10});
    return intersects;
}

function GetIntersectionGENE(){
    var vector=new THREE.Vector3(0, 0, 0);
    vector.unproject( camera );
    var camera_pos=controls.getObject().position;
    var raycaster=new THREE.Raycaster(camera_pos, vector.sub( camera_pos ).normalize());/*THREE.js v69*/
    var intersects=raycaster.intersectObjects(geneObjects);
    if (intersects.length == 0){
        return null;
    }
    closestObjectDistance=intersects[0].distance;
    intersects=$.grep(intersects, function(v){return v.distance<=closestObjectDistance+radiusOfTube/10});
    return intersects;
}

function GetIntersection(){
	var vector=new THREE.Vector3(0, 0, 0);
    vector.unproject( camera );
    var camera_pos=controls.getObject().position;
    var raycaster=new THREE.Raycaster(camera_pos, vector.sub( camera_pos ).normalize());/*THREE.js v69*/
	
    var intersects=raycaster.intersectObjects(objects);
	if (intersects.length == 0){
		return null;
	}
	return intersects[0];
}





function GetSelectedTrackPoints(intersectPoint, trackName){
	var intersectInModelCoordinates=Local2global(intersectPoint);
    /* trackPoints from 3dQuery*/
	var trackPoints=uploaded_splines[trackName][1];
	var chrid=trackName.split("-")[0];
	var closestPoint=-1;
	var minDistance=-1;
	for (var pointIndex=0; pointIndex<trackPoints.length; ++pointIndex){
        if (typeof trackPoints[pointIndex] == 'undefined'){
            if (DEBUG) console.log("ff+ "+pointIndex);
            continue;
        }
		var x=trackPoints[pointIndex][2];
		var y=trackPoints[pointIndex][3];
		var z=trackPoints[pointIndex][4];
		var distance=Math.pow(intersectInModelCoordinates.x-x, 2)+
						Math.pow(intersectInModelCoordinates.y-y, 2) +
						Math.pow(intersectInModelCoordinates.z-z, 2);
		if (minDistance == -1 || distance<minDistance){
			minDistance=distance;
			closestPoint=pointIndex;
		}
	}
    
    var start=closestPoint;
    while (start>0 && Math.abs(trackPoints[start][1]-trackPoints[closestPoint][1])<basesInSelection / 2){
    	--start;
    }
    var end=closestPoint;
    while (end<trackPoints.length-1 && Math.abs(trackPoints[end][1]-trackPoints[closestPoint][1])<basesInSelection / 2){
    	++end;
    }
    
   	function Interpolate(point, otherPoint, bpIndexNeed){
   		var bpIndex=trackPoints[point][1];
   		var bpIndexOther=trackPoints[otherPoint][1];
   		var coeff=(bpIndexNeed-bpIndex) / (bpIndexOther-bpIndex);
   		var xCoord=trackPoints[point][2]+(trackPoints[otherPoint][2]-trackPoints[point][2])*coeff;
   		var yCoord=trackPoints[point][3]+(trackPoints[otherPoint][3]-trackPoints[point][3])*coeff;
   		var zCoord=trackPoints[point][4]+(trackPoints[otherPoint][4]-trackPoints[point][4])*coeff;
   		return{x:xCoord, y:yCoord, z:zCoord};
   	}
   	
		var otherPoint=start<trackPoints.length-1 ? start+1:start;
		var exactStartPosition=Interpolate(start, otherPoint, trackPoints[closestPoint][1]-basesInSelection / 2);
		otherPoint=end>0 ? end-1:end;
		var exactEndPosition=Interpolate(end, otherPoint, trackPoints[closestPoint][1]+basesInSelection / 2);
	
	var selectionTrackPoints=[Global2local(exactStartPosition)];
	for (var pointIndex=start+1; pointIndex<end; ++pointIndex){
		selectionTrackPoints.push(Global2local({x:trackPoints[pointIndex][2], y:trackPoints[pointIndex][3], z:trackPoints[pointIndex][4]}));
	}
	selectionTrackPoints.push(Global2local(exactEndPosition));
    /*draw selection old-plane*/
    if (mode_id == 0)
    {
        var spline=new THREE.SplineCurve3(selectionTrackPoints);
        var segments=serviceForStructure=='3d' ? Math.floor(basesInSelection/6500):basesInSelection/50; 
        var radiusSegments=6;
        
        var tube=new THREE.TubeGeometry(spline, segments, radiusOfTube+10, radiusSegments, false, false);
        tube.dynamic=true;
        scene.remove(selectionMesh);

        delete selectionMesh;
        {
            var material=new THREE.MeshBasicMaterial({
                    color:0xff0000,
                    opacity:1,
                    wireframe:true,
                    transparent:false
            });                     
            
            selectionMesh=new THREE.Mesh(tube, material);
            selectionMesh.geometry.verticesNeedUpdate=true;
            scene.add(selectionMesh);
        }
        
    } else if (mode_id == 1)
	/*draw selection new-cube*/
    {
        /* var cube=new THREE.CubeGeometry(radiusSphere*2,radiusSphere*2,radiusSphere*2, 5, 5, 5);*/
        var cube=new THREE.BoxGeometry(radiusSphere*2,radiusSphere*2,radiusSphere*2/*, 5, 5, 5*/);
        cube.dynamic=true;
        scene.remove(selectionMesh);
        {
            var material=new THREE.MeshBasicMaterial({
                    color:0xff0000,
                    opacity:1,
                    wireframe:true,
                    transparent:false
            });                     
            
            selectionMesh=new THREE.Mesh(cube, material);
            {/*v69*/
                    selectionMesh.position.x=intersectPoint.x;
                    selectionMesh.position.y=intersectPoint.y;
                    selectionMesh.position.z=intersectPoint.z;
            }

            /* selectionMesh.position=new THREE.Vector3(intersectPoint.x, intersectPoint.y, intersectPoint.z); //v66*/

            /* selectionMesh.geometry.verticesNeedUpdate=true;*/
            scene.add(selectionMesh);
        }
        
    }
	return [chrid, trackPoints[closestPoint][1]-basesInSelection / 2, 
				trackPoints[closestPoint][1]+basesInSelection / 2]; 	
}

function ClearInfo(){
	if (infoBlock){
		infoBlock.innerHTML="";
        lastRegion=[];
        rgn=[];
        document.getElementById('detection-sign').style.display="none";
	}
}

function GetGeneOutput(isBeginningBRTag){
    
    if (!geneObjects || geneObjects.length == 0){
        return "";
    }
    
    var intersections=GetIntersectionGENE();
    if (intersections == null){
        return "";
    }

    deb_var=intersections;
    var result="@Genes:";
    if (isBeginningBRTag) result="<br>"+result;
    var temp, _name, _geneName;

    for (var inter_indx in intersections){
        _name=intersections[inter_indx].object.name;
        _geneName=_name.replace(/^[\dxy]+-(.*)/i, '$1')
        temp=uploaded_splines_genes[_name.toLowerCase()];
        result += _geneName+"(\""+temp[0]+"\","+temp[3]+"); ";
    }
    return result;
}

function PositionToString(region){
	var helix=region[0].split("_")[1];/*temp storage*/
    if (typeof helix == 'undefined')
        helix='';
    else if (helix == 'a') helix=', helix A';
    else helix=', helix B';

	var info="Selection:chromosome:"+region[0].split("_")[0]+ helix;
	info += ", bases:"+String(Math.floor(region[1]))+"&ndash;"+String(Math.floor(region[2]));
	return info;            	
}

function UploadRegionData(region){
	var request="start="+String(Math.floor(region[1])) 
				 +"&end="+String(Math.floor(region[2]))
				 +"&chrid="+String(region[0].replace(/^([\dxy]+).*/i, '$1').replace('23', 'X'));
    var url="http://1kgenome.exascale.info/range?"+request;		
    $.getJSON(url+"?callback=?", null, 
    	function(regionInfo){
    		var key=PositionToString(region);
    		var chrid=region[0];
    		chrid=chrid.replace("_b", "_a");
    		var key_a=PositionToString([chrid, region[1], region[2]]);
    		chrid=chrid.replace("_a", "_b");
    		var key_b=PositionToString([chrid, region[1], region[2]]);
    		formated_data="<br/>@Bases:<a target='_blank' style=\"color:rgb(0,255,0)\" href='http://1kgenome.exascale.info/range?"+request+"'>"+regionInfo.substring(0, 50)+"...</a>";
    		regionData[key_a][1]=formated_data;
    		regionData[key_b][1]=formated_data;
    		infoBlock.innerHTML=regionData[key][0]+ GetGeneOutput(true)+regionData[key][1]+regionData[key][2];
    	}
    ); 	
    
    {/*SNPs*/
    	var chrid=String(region[0]);
         if (DEBUG) console.log(chrid);
		var chridNoStrand=chrid.split('_')[0];
		var chridOnlyNumber=chridNoStrand;
		if (chridOnlyNumber[chridOnlyNumber.length-1] == "a"){
			chridOnlyNumber=chridOnlyNumber.substr(0, chridOnlyNumber.length-1);
		}
    	
		var request="chr="+((chridOnlyNumber=='23')?'X':chridOnlyNumber)+"&start="+String(Math.floor(region[1])) +
						 "&end="+String(Math.floor(region[2])); 
	    var url="http://1kgenome.exascale.info/js_snp?"+request;
	    $.getJSON(url+"?callback=?", null, 
	    	function(positions){
	    		snips="";
                var genotypeArray=[];
            	for (var point_index=0; point_index<positions.length; ++point_index){
            		var base_index=positions[point_index][0];

                    genotypeArray[point_index]=/*getFakeGenotypeForSNP();*/positions[point_index][2]+positions[point_index][3];
            		var snp_id=/*"rs"+*/String(positions[point_index][1]);
            		snips += " <a target=\"_blank\" style=\"color:rgb(255,255,0)\" href=\"http://www.ncbi.nlm.nih.gov/SNP/snp_ref.cgi?rs="+snp_id+"\">rs"+snp_id+"</a>;";
            	}

            	formated_data="<br/>@SNPs:"+snips;
            	var key=PositionToString(region);
	    		var chrid=region[0];
	    		chrid=chrid.replace("_b", "_a");
	    		var key_a=PositionToString([chrid, region[1], region[2]]);
	    		chrid=chrid.replace("_a", "_b");
	    		var key_b=PositionToString([chrid, region[1], region[2]]);
	    		regionData[key_a][2]=formated_data;
	    		regionData[key_b][2]=formated_data;
                regionData[key_a][3]=genotypeArray;
                regionData[key_b][3]=genotypeArray;
	    		infoBlock.innerHTML=regionData[key][0]+regionData[key][1]+regionData[key][2];
	    	}
	    );
    }		    

}

function buildCubeDataStructureSNPs(resultSet){
        if (resultSet == null || resultSet.length == 0){
            if (DEBUG) console.log("EMPTY area-you should not see this");
            return;
        }
     var arrRequestInfo=[];
     for (var track_index in resultSet){
        var chridOnlyNumber=resultSet[track_index].chr;
        arrRequestInfo[track_index]=[];
        for (var intervals_indx in resultSet[track_index].intervals){
            if (DEBUG) console.log("["+track_index+"]"+"["+intervals_indx+"]")
            var request="chr="+((chridOnlyNumber=='23')?'X':chridOnlyNumber)+"&start="+String(Math.floor(resultSet[track_index].intervals[intervals_indx].start)) +
                         "&end="+String(Math.floor(resultSet[track_index].intervals[intervals_indx].end)); 
            var url="http://1kgenome.exascale.info/js_snp?"+request;
            req_count++;
            arrRequestInfo[track_index][intervals_indx]=[];
            arrRequestInfo[track_index][intervals_indx][0]=[chridOnlyNumber, String(resultSet[track_index].intervals[intervals_indx].start), String(resultSet[track_index].intervals[intervals_indx].end)];
            arrRequestInfo[track_index][intervals_indx][1]=$.getJSON(url+"?callback=?", null, 
                function(positions){
                    snips="";
                    for (var point_index=0; point_index<positions.length; ++point_index){
                        var base_index=positions[point_index][0];
                        var snp_id=/*"rs"+*/String(positions[point_index][1]);
                        snips += " <a target=\"_blank\" style=\"color:rgb(0,0,255)\" href=\"http://www.ncbi.nlm.nih.gov/SNP/snp_ref.cgi?rs="+snp_id+"\">rs"+snp_id+"</a>;";
                    }
                    if (tableStrContent.length == 0) tableStrContent += snips;
                    else tableStrContent += "<br><hr>"+snips;

                    resp_count++;
                }
            );
        }
    }
    return arrRequestInfo;
}

function UpdateInfoChipSeq(){
    intersection=GetIntersectionCHIPSEQ();
    var temp;
    if (intersection == null){
        temp=GetGeneOutput();
        ClearInfo();
        if (temp == ""){
            return;
        } else{
            infoBlock.innerHTML=temp;
            return;
        }
    }
    
    var temp;
    if (typeof lastIntersection  != 'undefined' && intersection[0].point.x == lastIntersection.x && intersection[0].point.y == lastIntersection.y && intersection[0].point.z == lastIntersection.z){
        return;
    } else{
        ClearInfo();
        for (var inter_indx in intersection){
            temp=uploaded_splines_chip[intersection[inter_indx].object.name];
            infoBlock.innerHTML += "<a target='_blank' style='color:rgb(255,255,0)' href='http://genome.ucsc.edu/cgi-bin/hgTracks?db=hg19&position=chr"+temp[0]+"%3A"+temp[1]+"-"+temp[2]+"' >"+temp[0]+"-"+temp[1]+":"+temp[2]+" -> "+temp[3]+"("+temp[4]+")</a>; ";
        }
        infoBlock.innerHTML += GetGeneOutput(intersection.length>0);
        lastIntersection=intersection[0].point;
    }
}

function UpdateInfo(){
    if (mode_id == 2){
        UpdateInfoChipSeq();
        return;
    }

    intersection=GetIntersection();
    if (intersection == null){
        temp=GetGeneOutput();
        ClearInfo();
        if (temp == ""){
            return;
        } else{
            infoBlock.innerHTML=temp;
            return;
        }
    }

    if (mode_id == 1){
        if ((!selectionMesh.userData || selectionMesh.userData != radiusSphere) || (selectionMesh.position.x != intersection.point.x || selectionMesh.position.y != intersection.point.y || selectionMesh.position.z != intersection.point.z)){
            ClearInfo();
            /*draw selection new-cube*/
            {
                /* var cube=new THREE.CubeGeometry(radiusSphere*2,radiusSphere*2,radiusSphere*2, 5, 5, 5);*/
                var cube=new THREE.BoxGeometry(radiusSphere*2,radiusSphere*2,radiusSphere*2, 5, 5, 5);
                cube.dynamic=true;
                scene.remove(selectionMesh);
                {
                    var material=new THREE.MeshBasicMaterial({
                            color:0xff0000,
                            opacity:1,
                            wireframe:true,
                            transparent:false
                    });
                    selectionMesh=new THREE.Mesh(cube, material);
                    {/*v69*/
                        selectionMesh.position.x=intersection.point.x;
                        selectionMesh.position.y=intersection.point.y;
                        selectionMesh.position.z=intersection.point.z;
                    }
                    selectionMesh.userData=radiusSphere;
                    scene.add(selectionMesh);
                    infoblock.innerHTML=GetGeneOutput();
                }
            }
        }
        return;
    }

	object=intersection.object;
	point=intersection.point;
	if (object.name == ""){
        ClearInfo();
		return;
	}

    if ((typeof uploaded_splines[object.name] === 'undefined')){
        if (DEBUG) console.log("Warning:undefined!!!"); 
        ClearInfo();
        return;
    }

	var region=GetSelectedTrackPoints(point, object.name);
    rgn=region;
	var positionStr=PositionToString(region);
	if (positionStr in regionData && (lastRegion==null || lastRegion[0] != regionData[positionStr][0] && lastRegion[1] != regionData[positionStr][1] && lastRegion[2] != regionData[positionStr][2])){
		infoBlock.innerHTML=regionData[positionStr][0]+GetGeneOutput(true)+regionData[positionStr][1]+regionData[positionStr][2]; /*@TODO:change place of storing data for genotype!!! and call here only regionData[positionStr]*/
        lastRegion=regionData[positionStr];
        
        if (isCustomerData){
            var custDataArray=customerData[uploaded_splines[object.name][4]].slice(uploaded_splines[object.name][2],uploaded_splines[object.name][3]+1);
            var startRegPos=parseInt(region[1]);
            var endRegPos=parseInt(region[2]);
            for (var indx=0; indx<custDataArray.length; indx++){
                if ( custDataArray[indx][0]<startRegPos ) continue;
                else if (custDataArray[indx][0]>endRegPos ){
                    document.getElementById('detection-sign').style.display="none";
                    break;
                }
                else{
                    document.getElementById('detection-sign').style.display="";
                    break;
                }
            }
        }
        
	} else if (!(positionStr in regionData)){
		/*show something immidiately*/
		infoBlock.innerHTML=positionStr+"<br/>data uploading...";
		/*also works like flag:request is already sent*/
		regionData[PositionToString([region[0].replace("_b", "_a"), region[1], region[2]])]=[positionStr, "", ""];
		regionData[PositionToString([region[0].replace("_a", "_b"), region[1], region[2]])]=[positionStr, "", ""];
        /*show snps of the user here*/
        
        if (isCustomerData){
            var custDataArray=customerData[uploaded_splines[object.name][4]].slice(uploaded_splines[object.name][2],uploaded_splines[object.name][3]+1);
            var startRegPos=parseInt(region[1]);
            var endRegPos=parseInt(region[2]);
            for (var indx=0; indx<custDataArray.length; indx++){
                if ( custDataArray[indx][0]<startRegPos ) continue;
                else if (custDataArray[indx][0]>endRegPos ){
                    document.getElementById('detection-sign').style.display="none";
                    break;
                }
                else{
                    document.getElementById('detection-sign').style.display="";
                    break;
                }
            }
        }
        
        
		UploadRegionData(region);            		
	}
}

function animate(){
        window.requestAnimFrame(animate);
        // requestAnimationFrame( animate );
        UpdateTargetBallPosition();
        UpdateInfo();
       	UpdateModel();
        controls.update( Date.now()-time );
        renderer.render( scene, camera );
        octree.update();
        time=Date.now();
}

function showErrorAlertModalWindow(message, explanation, functionBeforeCallback){
    if (!if_messenger_error){
        var _div_container=document.createElement('div');
        var _p_message=document.createElement('p');
        appendStringAsNodes(_p_message, explanation);
        _div_container.appendChild(_p_message);
        if_messenger_error_chkBox=document.createElement('input');
        if_messenger_error_chkBox.type="checkbox";
        if_messenger_error_chkBox.name="if_messenger_error";
        _div_container.appendChild(if_messenger_error_chkBox);
        var _span=document.createElement('span');
        appendStringAsNodes(_span, "Show all notifications in the messenger at the bottom of the screen.");
        _div_container.appendChild(_span);
        drawMessiModalWindow(_div_container, 'Error Message', null, null, false, true, 'anim error', functionBeforeCallback);
    } else{
        showMessengerBlock();
        if (functionBeforeCallback) functionBeforeCallback();
        messenger_block.innerHTML=message;
        timeOutId=window.setTimeout(disableMessengerBlock, 5000)
        if (previousTimeOutId) clearTimeout(previousTimeOutId);
        previousTimeOutId=timeOutId;
    }
}

function exitFromFullScreen(){
    /* document.exitFullscreen=document.mozCancelFullScreen || document.webkitCancelFullScreen || document.msExitFullscreen;*/
    /* document.exitFullscreen();*/
}

function enterInFullScreen(){
    /* var element=document.body;*/
    /* element.requestFullscreen=element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;*/
    /* element.requestFullscreen();*/
}

function exitPointerLockFunction(){
    is_modal_opened=true;
    $('p#textmode').text('');
    document.exitPointerLock=document.exitPointerLock ||
                                document.mozExitPointerLock ||
                                document.webkitExitPointerLock;
    document.exitPointerLock();
    keys_block.style.display="none";
    distancePoints_block.style.display="none";
    if ( /Firefox/i.test( navigator.userAgent ) ) exitFromFullScreen();
}

function popupInProgressSymbol (){
    if (spinner) spinner.stop();
    controls.changeIsKeyEnabled();
    spinner=new Spinner(opts).spin(divElement);
}

function hideInProgressSymbol (){
    spinner.stop();
    controls.changeIsKeyEnabled();
}

function getDistanceBetweenTwoPoints(_firstPoint, _secondPoint, accuracy){/*accuracy=number digits after point*/
    return (Math.sqrt(Math.pow(_firstPoint.x-_secondPoint.x, 2)+Math.pow(_firstPoint.y-_secondPoint.y, 2)+Math.pow(_firstPoint.z-_secondPoint.z, 2))).toFixed(accuracy);
}

function keys_block_management(isOnlyWidth){
    var doc_height=$(document).height();
    var ui_tab_height=$("ul.ui-tabs-nav").height();
    console.log("Ha: " + doc_height + " : " + (doc_height-2*(ui_tab_height-STANDARD_FIXED_HEIGHT_UI_TABS_NAV)) + " : " + (doc_height-2*(ui_tab_height-STANDARD_FIXED_HEIGHT_UI_TABS_NAV)) + " : " + 
        (doc_height-2*(ui_tab_height-STANDARD_FIXED_HEIGHT_UI_TABS_NAV)));
    if (doc_height<MIN_FIXED_HEIGHT_SCREEN_WO_THERMOMETER+2*(ui_tab_height-STANDARD_FIXED_HEIGHT_UI_TABS_NAV)){
        if (isOnlyWidth) return;
        keys_block.style.display="none";
    } else if (doc_height<MIN_FIXED_HEIGHT_SCREEN+2*(ui_tab_height-STANDARD_FIXED_HEIGHT_UI_TABS_NAV)){
        keys_block.style.width="80px";
        isNonDisplayThermometer=true;
        if (isOnlyWidth) return;
        document.getElementById("thermometer").style.display="none";
        keys_block.style.display="block";
    } else if (doc_height<MIDDLE_FIXED_HEIGHT_SCREEN+2*(ui_tab_height-STANDARD_FIXED_HEIGHT_UI_TABS_NAV)){
        isNonDisplayThermometer=false;
        keys_block.style.width="80px";
        if (isOnlyWidth){return;}
        keys_block.style.display="block";
    } else{
        isNonDisplayThermometer=false;
        keys_block.style.width="35px";
        if (isOnlyWidth){return;}
        keys_block.style.display="block";
    }
}

function drawPointSphere(init_pos){
    var sphere=new THREE.Mesh(new THREE.SphereGeometry(1.5*radiusOfTube, 100, 100), new THREE.MeshNormalMaterial());
    sphere.overdraw=true;
    sphere.position.x=init_pos.x;
    sphere.position.y=init_pos.y;
    sphere.position.z=init_pos.z;
    scene.add(sphere);
    return sphere;
}

function drawMessiModalWindow(content, title, top, left, isDelayed, isCenter, titleClass, functionBeforeCallback, afterMessiDrawFunction){
    if (!titleClass) titleClass='success';
    var callbackFunc=function(val){
        var element=document.body;
        if (functionBeforeCallback)
            functionBeforeCallback();
        if ( /Firefox/i.test( navigator.userAgent ) ){enterInFullScreen();}
        element.requestPointerLock=element.requestPointerLock||element.mozRequestPointerLock||element.webkitRequestPointerLock;
        element.requestPointerLock();
        document.getElementById('detection-sign').style.display="none";
        keys_block_management();
        distancePoints_block.style.display="block";
        if (titleClass != "success"){
            if_messenger_error=if_messenger_error_chkBox.checked;
        }
        is_modal_opened=false;
    }
    if (!isDelayed){
        exitPointerLockFunction();
    }
    if (isCenter)
        _messi=new Messi(content,{title:title, center:isCenter, titleClass:titleClass, buttons:[{id:0, label:'Ok', val:'O'}], 
        callback:callbackFunc});
    else
        _messi=new Messi(content,{title:title, center:isCenter, viewport:{top:top, left:left}, titleClass:titleClass, buttons:[{id:0, label:'Ok', val:'O'}], 
        callback:callbackFunc});

    if (afterMessiDrawFunction) afterMessiDrawFunction();
}

function disableMessengerBlock(){
    messenger_block.style.display="none";    
}

function showMessengerBlock(){
    messenger_block.style.display="inline";    
}

keys_block=document.getElementById('keys');
keys_block.style.display="none";
messenger_block=document.getElementById('messenger');

distancePoints_block=document.getElementById('distancePoints');
distancePoints_block.style.display="none";
infoBlock=document.getElementById("infoblock")

imgTextContainer=document.getElementById("img_text_container");
var result_scale=((scaleFactor/blockSize).toFixed(0));
if (result_scale==0) result_scale="1:"+((blockSize/scaleFactor).toFixed(0));
else result_scale +=  ":1"
imgTextContainer.innerHTML=result_scale;

footerPanel=document.getElementById("footPanel");
document.getElementById("detection-sign").style.bottom=String(infoBlock.clientHeight)+"px";
document.getElementById('detection-sign').style.display="none";