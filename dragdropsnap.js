
var $AGENT = navigator.userAgent.toLowerCase();
var $MAC = ($AGENT.indexOf("mac") != -1) ? 1 : 0;
var $IE5_5 = ($AGENT.indexOf("msie 5.5") != -1) ? 1 : 0;
var $IE5 = ($AGENT.indexOf("msie 5.0") != -1) ? 1 : 0;
var $IE4 = ($IE5 || $IE5_5) ? 0 : 1;
var $OFFHACKX = ($MAC) ? 8 : 0;
var $OFFHACKY = ($MAC) ? 13 : 0; // a discrepancy i need to find a better solution for
var $ZCEIL = 20000; // set < ghost z
var $ZFLOOR = 1001; // set > drop and snap targets
var $EI = new Array();
var $DT = new Array();
var $ST = new Array();
var $ZT = new Array();
/* INTERESTING NOTE
   if you set the above arrays like so:
   var $EI = $DT = $ST = $ZT = new Array();
   the drag/drop etc. systems fail.
   i'm interested as to why.  scope?
*/
$EI.ACTIVE = $EI.MODE = $EI.ACTIVE_TARGET = $EI.NXOFF = $EI.NYOFF = null;

function mapTarget(kind,width,height,left,top,accepts)
  {
    var MT = kind || 'DROP';
    var PR = new Object();
    var OB = (MT == 'DROP') ? $DT : $ST;
    PR.W = width || 20;
    PR.H = height || 20;
    PR.L = left || 0;
    PR.T = top || 0;
	PR.accepts = (accepts) ? accepts.split(',') : new Array();
    OB[OB.length] = PR;
    return;
  }

function showTarget()
  { 
    if($EI.ACTIVE_TARGET)
      {
        var TT = ($EI.MODE == 2) ? SHADOW : SNAPTO;
        var AA = $EI.ACTIVE_TARGET;
        with(TT.style)
          {
            width = AA.W;
            height = AA.H;
            top = AA.T;
            left = AA.L;
            visibility = 'visible';
          }
      } 
    return;
  }

function init()
  {
    var D = document.images;
	var DA = document.all;
    with(document)
      {
        onmousemove = mouseMove;
        onmousedown = mouseDown;
        onmouseup = mouseUp;
        onclick = mouseClick;
      }
    for(x=0; x < D.length; x++)
      {
        if(D[x].id)
          {
            if(D[x].className == 'DROP_TARGET') 
              { mapTarget('DROP',D[x].style.pixelWidth,D[x].style.pixelHeight,D[x].style.pixelLeft,D[x].style.pixelTop,D[x].ACCEPTS);
              }
            else if(D[x].className == 'SNAP_TARGET') 
              { mapTarget('SNAP',D[x].style.pixelWidth,D[x].style.pixelHeight,D[x].style.pixelLeft,D[x].style.pixelTop);
              }
          }
      }
	for(i=0; i < DA.length; i++)
	  {
	    if(DA[i].className == 'DRAG_OBJECT')
		  {
		    DA[i].onmousedown = function()
			  {
			    $EI.ACTIVE = this.id;
				updateZ();
				$EI.ACTIVE = null;
		      }
		  }
	  }
	 document.body.insertAdjacentHTML("beforeEnd",'<DIV ID="GHOST" STYLE="position:absolute; width:10; height:10; left:0; top:0; border:1px white dashed; visibility:hidden; z-index:21000;"></DIV><DIV ID="SHADOW" STYLE="position:absolute; width:10; height:10; left:0; top:0; background-image:url(shadow.gif); z-index:1000; visibility:hidden;"></DIV><DIV ID="SNAPTO" STYLE="position:absolute; width:10; height:10; left:0; top:0; background-image:url(lock.gif); visibility:hidden; z-index:1000;"></DIV>');

	/*************
	 * add custom drop/snap targets here. format:
	 * ('DROP' || 'SNAP', WIDTH, HEIGHT, LEFT, TOP, 'VALID,DROP,TARGETS')
	 *
	 */
	 
    mapTarget('DROP',40,40,400,50,'BLAH,BLECK,HA,IMAGE_TARGET');
    mapTarget('SNAP',100,100,300,400);
	
    return;
  }
 
function mouseMove()
  {
    var e = window.event;
    if(!$EI.ACTIVE)
      {
        $EI.SE = e.srcElement;
		$EI.SSTY = e.srcElement.style;
		$EI.PSTY = e.srcElement.parentElement.style;
        $EI.PE = e.srcElement.parentElement;
        $EI.SID = e.srcElement.id;
        $EI.PID = e.srcElement.parentElement.id;
        $EI.X = e.clientX;
        $EI.Y = e.clientY;
        $EI.SCLASS = e.srcElement.className;
        $EI.PCLASS = e.srcElement.parentElement.className;
        $EI.SXOFFSET = e.srcElement.offsetLeft;
        $EI.PXOFFSET = e.srcElement.parentElement.offsetLeft;
        $EI.SYOFFSET = e.srcElement.offsetTop;
        $EI.PYOFFSET = e.srcElement.parentElement.offsetTop;
        $EI.SCREEN_X = screen.availWidth;
        $EI.SCREEN_Y = screen.availHeight;
      }
    else 
      {
        with(GHOST.style)
          {
            left = e.clientX - $EI.X + $EI.NXOFF + $OFFHACKX;
            top = e.clientY - $EI.Y + $EI.NYOFF + $OFFHACKY;
          }
        if(($EI.MODE == 2) || ($EI.MODE == 3))
          {
            var OB = GHOST.style;
            var TR = ($EI.MODE == 2) ? $DT : $ST;
            for(x=0; x < TR.length; x++)
              {  
                if(  
                    ( ((OB.pixelLeft + OB.pixelWidth) > TR[x].L) &&
					  (OB.pixelLeft < (TR[x].L + TR[x].W)) )
                  &&
                    ( ((OB.pixelTop + OB.pixelHeight) > TR[x].T) &&
					  (OB.pixelTop < (TR[x].T + TR[x].H)) )
                  )
                  { 
                    $EI.ACTIVE_TARGET = TR[x];
                    showTarget(); 
                    break;
                  } else { $EI.ACTIVE_TARGET = null; }
              }
            if(!$EI.ACTIVE_TARGET) 
              { 
                SHADOW.style.visibility = 'hidden'; 
                SNAPTO.style.visibility = 'hidden';
              }
          }       
      }
	window.event.cancelBubble = true;
	window.event.returnValue = false;
    return; 
  }

function mouseDown()
  { 
    if(!bubbleUntil($EI.SE,'DRAG_BODY')) 
	  {
        var A = bubbleUntil($EI.SE,'DRAG_TITLE');
	    var B = bubbleUntil($EI.SE,'DD_OBJECT');
	    var C = bubbleUntil($EI.SE,'SNAP_OBJECT');
	    var D = bubbleUntil($EI.SE,'DRAG_OBJECT');
	
	    $EI.MODE = (A) ? 1 : (B) ? 2 : (C) ? 3 : (D) ? 4 : null;
      }
    if($EI.MODE)
      {  
	    $EI.NXOFF = (A) ? $EI.PXOFFSET : (B) ? B.offsetLeft : (C) ? C.offsetLeft : (D) ? D.offsetLeft : 0;
	    $EI.NYOFF = (A) ? $EI.PYOFFSET : (B) ? B.offsetTop : (C) ? C.offsetTop : (D) ? D.offsetTop : 0;
	    $EI.ACTIVE = (A) ? $EI.PID : (B) ? B.id : (C) ? C.id : (D) ? D.id : null;
        updateZ();
        showDragMode();
        window.event.cancelBubble = true;
        window.event.returnValue = false;            
      }
    return; 
  }
  
 function mouseUp()
  {
    if($EI.MODE)
	  {
        GHOST.style.visibility = SHADOW.style.visibility = SNAPTO.style.visibility = 'hidden';
	    ($EI.MODE == 1) && (dropDRAG_OBJECT());
        ($EI.MODE == 2) && (dropDD_OBJECT());
        ($EI.MODE == 3) && (dropSNAP_OBJECT());
        ($EI.MODE == 4) && (dropDRAG_OBJECT());
        document.onselectstart = null;
	  }
	if($EI.MODE != 1) // necessary resets; probably a better way to do this.
	  {
	    $EI.X = window.event.clientX;
	    $EI.Y = window.event.clientY;
      } else { mouseMove(); }
    $EI.ACTIVE = $EI.ACTIVE_TARGET = $EI.MODE = null;
    return; 
  }
  
function mouseClick()
  {
    return; 
  }

function showDragMode()
  {
    var EL = document.all[$EI.ACTIVE].style;
    with(GHOST.style)
      {
        width = EL.pixelWidth;
        height = EL.pixelHeight + (($EI.MODE == 1) ? $EI.SSTY.pixelHeight : 0);
        top = EL.pixelTop;
        left = EL.pixelLeft;
        visibility = 'visible';
      }
    document.onselectstart = function() { return false; }
    return;
  }

function dropDRAG_OBJECT()
  {
    with(document.all[$EI.ACTIVE].style)
      {
        left = GHOST.style.left;
        top = GHOST.style.top;
      }
    return;  
  }

function dropSNAP_OBJECT()
  {
    var GH = GHOST.style;
    var AT = $EI.ACTIVE_TARGET || null;
	with(document.all[$EI.ACTIVE].style)
	  {
	    left = (AT) ? AT.L : GH.pixelLeft;
		top = (AT) ? AT.T : GH.pixelTop;
		width = (AT) ? AT.W : GH.pixelWidth;
		height = (AT) ? AT.H : GH.pixelHeight;
	  }
    return;
  }

function dropDD_OBJECT()
  {
    var AT = $EI.ACTIVE_TARGET || null
	var SK = document.all[$EI.ACTIVE].SEEKS;
	if(AT && SK)
	  {
	    for(x=0; x < AT.accepts.length; x++)
		  {
		    if(AT.accepts[x] == SK)
			  {
			    handleDropAction(SK);
				break;
			  }
		  }
	  }
    return;
  }

function handleDropAction(ac)
  {
    switch(ac)
	  {
	    case 'IMAGE_TARGET':
		  alert($EI.ACTIVE + ' - ' + $EI.ACTIVE_TARGET);
		break;
		
		default:
		break;
	  }
	return;
  }

function updateZ()
  { 
    var cur = $ZT[$EI.ACTIVE] = document.all[$EI.ACTIVE].style;
    for(z in $ZT)
      {
        $ZT[z].zIndex = (cur == $ZT[z]) ? $ZCEIL : Math.max($ZT[z].zIndex-1,$ZFLOOR);
      }
    return;
  }
  
function bubbleUntil(start,finish,attrib)
  { 
    var PP = start;
	var AA = attrib || 'className';
    do
      {
        if(eval("PP." + AA + "==finish")) { return(PP); }
        PP = PP.parentElement;
      } while(PP != null)
    return(false);
  }

