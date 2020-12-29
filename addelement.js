var t = setTimeout(function(){
  console.log($('#elementID'));
}, 2000);



function attributeValue(value) {
  if (value.indexOf("'") < 0) {
    return "'" + value + "'"
  } else if (value.indexOf('"') < 0) {
    return '"' + value + '"'
  } else {
    let result = 'concat('
    let part = ''
    let didReachEndOfValue = false
    while (!didReachEndOfValue) {
      let apos = value.indexOf("'")
      let quot = value.indexOf('"')
      if (apos < 0) {
        result += "'" + value + "'"
        didReachEndOfValue = true
        break
      } else if (quot < 0) {
        result += '"' + value + '"'
        didReachEndOfValue = true
        break
      } else if (quot < apos) {
        part = value.substring(0, apos)
        result += "'" + part + "'"
        value = value.substring(part.length)
      } else {
        part = value.substring(0, quot)
        result += '"' + part + '"'
        value = value.substring(part.length)
      }
      result += ','
    }
    result += ')'
    return result
  }
}

function xpathHtmlElement(name) {
  if (this.window.document.contentType == 'application/xhtml+xml') {
    // "x:" prefix is required when testing XHTML pages
    return 'x:' + name
  } else {
    return name
  }
}

function relativeXPathFromParent(current) {
  let index = this.getNodeNbr(current)
  let currentPath = '/' + this.xpathHtmlElement(current.nodeName)
  if (index > 0) {
    currentPath += '[' + (index + 1) + ']'
  }
  return currentPath
}

function getNodeNbr(current) {
  let childNodes = current.parentNode.childNodes
  let total = 0
  let index = -1
  for (let i = 0; i < childNodes.length; i++) {
    let child = childNodes[i]
    if (child.nodeName == current.nodeName) {
      if (child == current) {
        index = total
      }
      total++
    }
  }
  return index
}

function createXPathFromElement(elm) { 
  var allNodes = document.getElementsByTagName('*'); 
  for (var segs = []; elm && elm.nodeType == 1; elm = elm.parentNode) 
  { 
      if (elm.hasAttribute('id')) { 
              var uniqueIdCount = 0; 
              for (var n=0;n < allNodes.length;n++) { 
                  if (allNodes[n].hasAttribute('id') && allNodes[n].id == elm.id) uniqueIdCount++; 
                  if (uniqueIdCount > 1) break; 
              }; 
              if ( uniqueIdCount == 1) { 
                  segs.unshift('id("' + elm.getAttribute('id') + '")'); 
                  return segs.join('/'); 
              } else { 
                  segs.unshift(elm.localName.toLowerCase() + '[@id="' + elm.getAttribute('id') + '"]'); 
              } 
      } else if (elm.hasAttribute('class')) { 
          segs.unshift(elm.localName.toLowerCase() + '[@class="' + elm.getAttribute('class') + '"]'); 
      } else { 
          for (i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling) { 
              if (sib.localName == elm.localName)  i++; }; 
              segs.unshift(elm.localName.toLowerCase() + '[' + i + ']'); 
      }; 
  }; 
  return segs.length ? '/' + segs.join('/') : null; 
}; 

function findElement(path) { 
  var evaluator = new XPathEvaluator();
  if(path.startsWith("xpath=")){
    path = path.replace("xpath=","");
  } 
  var result = evaluator.evaluate(path, document.documentElement, null,XPathResult.FIRST_ORDERED_NODE_TYPE, null); 
  return  result.singleNodeValue; 
} 


function preciseXPath(xpath, e) {
  //only create more precise xpath if needed
  if (this.findElement(xpath) != e) {
    let result = e.ownerDocument.evaluate(
      xpath,
      e.ownerDocument,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    )
    //skip first element (result:0 xpath index:1)
    for (let i = 0, len = result.snapshotLength; i < len; i++) {
      let newPath = 'xpath=(' + xpath + ')[' + (i + 1) + ']'
      if (this.findElement(newPath) == e) {
        return newPath
      }
    }
  }
  return 'xpath=' + xpath
}

function getFullName(e, loopCount) {
  var element = e;
  var document = element.ownerDocument;
  var eleName ="";
  var textElement=element;
  var count = 0;


  if(element.getAttribute("data-dyn-savedtooltip")!==null && element.getAttribute("data-dyn-savedtooltip")!="") {
    var text = element.getAttribute("data-dyn-savedtooltip");
    eleName =  text;
  }
  if(eleName=="" && element.getAttribute("aria-label")!==null && element.getAttribute("aria-label")!=""){
      var eleName = element.getAttribute("aria-label");
      var quickcount = 0
      var elems = document.querySelectorAll("[aria-label='"+eleName+"']");
      for (var i = 0; i < arrayLength; i++) {
          quickcount = quickcount + 1
          if(elems[i]==element){
              count = quickcount;
          }
      }
      if(element.getAttribute("data-colindex")!==null && element.getAttribute("data-colindex")!=""){
        eleName = eleName + " row"
      }
  } if(eleName=="" && element.id!="" && element.id != null && element.id !== undefined && document.querySelectorAll("[for='"+element.id+"']").length>0) {
    var ele = document.querySelectorAll("[for='"+element.id+"']")[0];
    eleName = ele.textContent.trim();
    textElement = ele;
} if(eleName=="" && element.getAttribute("aria-label")!==null && element.getAttribute("aria-label")!="") {
    var text = element.getAttribute("aria-label");
    eleName =  text;
}  if(eleName=="" && element.getAttribute("aria-labelledby")!==null && element.getAttribute("aria-labelledby")!="") {
      var id_to_find = element.getAttribute("aria-labelledby");
      var ele = document.getElementById(id_to_find);
      eleName = ele.textContent.trim();
      textElement = ele;
  } if(eleName=="" && element.getAttribute("aria-describedby")!==null && element.getAttribute("aria-describedby")!="") {
    var id_to_find = element.getAttribute("aria-describedby");
    var ele = document.getElementById(id_to_find);
    eleName = ele.textContent.trim();
    textElement = ele;
}if(eleName=="" && element.textContent!=""){
  var eleName= element.textContent.trim();
}
if(eleName=="" && element.getAttribute("data-dyn-title")!==null && element.getAttribute("data-dyn-title")!="") {
    var text = element.getAttribute("data-dyn-title");
    eleName = text;
  }if(eleName=="" && element.getAttribute("alt")!==null && element.getAttribute("alt")!="") {
    var text = element.getAttribute("alt");
    eleName = text;
  }if(eleName=="" && element.getAttribute("value")!==null && element.getAttribute("value")!="") {
      var text = element.getAttribute("value");
      eleName = text;
  } if(eleName=="" && element.getAttribute("title")!==null && element.getAttribute("title")!="") {
      var text = element.getAttribute("title");
      eleName = text;
  } if(eleName=="" && element.getAttribute("id")!==null && element.getAttribute("id")!="") {
      var text = element.getAttribute("id");
      eleName = text;
  } if(eleName==""){
    eleName = "unnamed";
  }
  
  var elems = document.querySelectorAll("*")
  var arrayLength = elems.length;
  
  if(eleName != "unnamed" && count>1){
      eleName = eleName+"["+count+"]";
  }
  
  function isDescendant(parent, child) {
    var node = child.parentNode;
    while (node != null) {
        if (node == parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}


if(eleName != "unnamed" && count==0){
   var visibleEles = [];
     for (var i = 0; i < arrayLength; i++) {
         if(elems[i].textContent == eleName){
             var rect = elems[i].getBoundingClientRect();
             
             if(rect.top ==0 && rect.right ==0 && rect.bottom == 0 && rect.left ==0){
               //log element not visible?
             }
             else{
                 if(visibleEles.length>0){
                     var isDesc = false;
                     for (var j = 0; j < visibleEles.length; j++) {
                       if(isDescendant(visibleEles[j],elems[i])){
                           isDesc = true
                       }
                       if(isDescendant(elems[i],visibleEles[j])){
                        isDesc = true
                       }
                     }
                     if(!isDesc){
                         count = count+1
                         visibleEles[visibleEles.length-1] = elems[i]
                         console.log("recording element "+ count);
                         console.log(rect.top, rect.right, rect.bottom, rect.left);
                         console.log(document.defaultView.getComputedStyle(elems[i], "").getPropertyValue("display"));
                         console.log(document.defaultView.getComputedStyle(elems[i], "").getPropertyValue("visibility"));
                         console.log(elems[i])
                     }
                 }else{
                   console.log("recording element 1");
                   console.log(rect.top, rect.right, rect.bottom, rect.left);
                   console.log(document.defaultView.getComputedStyle(elems[i], "").getPropertyValue("display"));
                   console.log(document.defaultView.getComputedStyle(elems[i], "").getPropertyValue("visibility"));
                   console.log(elems[i])
                   visibleEles[0] = elems[i]
                   count = count + 1;
                 }
               
               //console.log(rect.top, rect.right, rect.bottom, rect.left);
               //console.log(document.defaultView.getComputedStyle(elems[i], "").getPropertyValue("display"));
         //console.log(document.defaultView.getComputedStyle(elems[i], "").getPropertyValue("visibility"));
               //console.log(elems[i])
             }
         }
         if(count>1 && elems[i]==textElement){
             eleName = eleName+"["+count+"]";
         }
         if(elems[i]==textElement){
          break;
         }
     }
 }
  if(eleName == "unnamed"){
    if(loopCount < 6){
      eleName = getFullName(e.parentNode, loopCount+1)
    }
  }
  return eleName;
}

function xpathHrefid(e) {
  if (e.attributes && e.hasAttribute('id')) {
    var idValue = e.getAttribute('id')
    var splitID = idValue.split(/(\d+)/);
    var xpathReturn = `//${e.nodeName.toLowerCase()}`
    for(var i=0; i < splitID.length; i++){
      if(isNaN(splitID[i])){
        xpathReturn = xpathReturn + "[contains(@id, '" + splitID[i] + "')]"
      }
    }
    return this.preciseXPath(xpathReturn, e)
  }
  return null
}

function xpathLink(e) {
  if (e.nodeName == 'A') {
    let text = e.textContent
    if (!text.match(/^\s*$/)) {
      return this.preciseXPath(
        '//' +
          this.xpathHtmlElement('a') +
          "[contains(text(),'" +
          text.replace(/^\s+/, '').replace(/\s+$/, '') +
          "')]",
        e
      )
    }
  }
  return null
}

function xpathImg(e) {
  if (e.nodeName == 'IMG') {
    if (e.alt != '') {
      return this.preciseXPath(
        '//' +
          this.xpathHtmlElement('img') +
          '[@alt=' +
          this.attributeValue(e.alt) +
          ']',
        e
      )
    } else if (e.title != '') {
      return this.preciseXPath(
        '//' +
          this.xpathHtmlElement('img') +
          '[@title=' +
          this.attributeValue(e.title) +
          ']',
        e
      )
    } else if (e.src != '') {
      return this.preciseXPath(
        '//' +
          this.xpathHtmlElement('img') +
          '[contains(@src,' +
          this.attributeValue(e.src) +
          ')]',
        e
      )
    }
  }
  return null
}

function xpathAttr(e) {
  const PREFERRED_ATTRIBUTES = [
    'id',
    'name',
    'value',
    'type',
    'action',
    'onclick',
  ]
  let i = 0

  function attributesXPath(name, attNames, attributes) {
    let locator = '//' + this.xpathHtmlElement(name) + '['
    for (i = 0; i < attNames.length; i++) {
      if (i > 0) {
        locator += ' and '
      }
      let attName = attNames[i]
      locator += '@' + attName + '=' + this.attributeValue(attributes[attName])
    }
    locator += ']'
    return this.preciseXPath(locator, e)
  }

  if (e.attributes) {
    let atts = e.attributes
    let attsMap = {}
    for (i = 0; i < atts.length; i++) {
      let att = atts[i]
      attsMap[att.name] = att.value
    }
    let names = []
    // try preferred attributes
    for (i = 0; i < PREFERRED_ATTRIBUTES.length; i++) {
      let name = PREFERRED_ATTRIBUTES[i]
      if (attsMap[name] != null) {
        names.push(name)
        let locator = attributesXPath.call(
          this,
          e.nodeName.toLowerCase(),
          names,
          attsMap
        )
        if (e == this.findElement(locator)) {
          return locator
        }
      }
    }
  }
  return null
}

function xpathAttr(e) {
  const PREFERRED_ATTRIBUTES = [
    'name',
    'value',
    'type',
    'action',
    'onclick',
  ]
  let i = 0

  function attributesXPath(name, attNames, attributes) {
    let locator = '//' + this.xpathHtmlElement(name) + '['
    for (i = 0; i < attNames.length; i++) {
      if (i > 0) {
        locator += ' and '
      }
      let attName = attNames[i]
      locator += '@' + attName + '=' + this.attributeValue(attributes[attName])
    }
    locator += ']'
    return this.preciseXPath(locator, e)
  }

  if (e.attributes) {
    let atts = e.attributes
    let attsMap = {}
    for (i = 0; i < atts.length; i++) {
      let att = atts[i]
      attsMap[att.name] = att.value
    }
    let names = []
    // try preferred attributes
    for (i = 0; i < PREFERRED_ATTRIBUTES.length; i++) {
      let name = PREFERRED_ATTRIBUTES[i]
      if (attsMap[name] != null) {
        names.push(name)
        let locator = attributesXPath.call(
          this,
          e.nodeName.toLowerCase(),
          names,
          attsMap
        )
        if (e == this.findElement(locator)) {
          return locator
        }
      }
    }
  }
  return null
}

function xpathIdRelativePartial(e) {
  let path = ''
  let current = e
  while (current != null) {
    if (current.parentNode != null) {
      path = this.relativeXPathFromParent(current) + path
      if (
        1 == current.parentNode.nodeType && // ELEMENT_NODE
        current.parentNode.getAttribute('id')
      ) {
        var idValue = current.parentNode.getAttribute('id')
        var splitID = idValue.split(/(\d+)/);
        var xpathReturn = `//${current.parentNode.nodeName.toLowerCase()}`
        for(var i=0; i < splitID.length; i++){
          if(isNaN(splitID[i])){
            xpathReturn = xpathReturn + "[contains(@id, '" + splitID[i] + "')]"
          }
        }
        return this.preciseXPath(xpathReturn +
            path,
          e
        )
      }
    } else {
      return null
    }
    current = current.parentNode
  }
  return null
}

function xpathIdRelative(e) {
  let path = ''
  let current = e
  while (current != null) {
    if (current.parentNode != null) {
      path = this.relativeXPathFromParent(current) + path
      if (
        1 == current.parentNode.nodeType && // ELEMENT_NODE
        current.parentNode.getAttribute('id')
      ) {
        return this.preciseXPath(
          '//' +
            this.xpathHtmlElement(current.parentNode.nodeName.toLowerCase()) +
            '[@id=' +
            this.attributeValue(current.parentNode.getAttribute('id')) +
            ']' +
            path,
          e
        )
      }
    } else {
      return null
    }
    current = current.parentNode
  }
  return null
}

function xpathHref(e) {
  if (e.attributes && e.hasAttribute('href')) {
    let href = e.getAttribute('href')
    if (href.search(/^http?:\/\//) >= 0) {
      return this.preciseXPath(
        '//' +
          this.xpathHtmlElement('a') +
          '[@href=' +
          this.attributeValue(href) +
          ']',
        e
      )
    } else {
      // use contains(), because in IE getAttribute("href") will return absolute path
      return this.preciseXPath(
        '//' +
          this.xpathHtmlElement('a') +
          '[contains(@href, ' +
          this.attributeValue(href) +
          ')]',
        e
      )
    }
  }
  return null
}

function xpathPosition(
  e,
  opt_contextNode
) {
  let path = ''
  let current = e
  while (current != null && current != opt_contextNode) {
    let currentPath
    if (current.parentNode != null) {
      currentPath = this.relativeXPathFromParent(current)
    } else {
      currentPath = '/' + this.xpathHtmlElement(current.nodeName)
    }
    path = currentPath + path
    let locator = '/' + path
    if (e == this.findElement(locator)) {
      return 'xpath=' + locator
    }
    current = current.parentNode
  }
  return null
}

function xpathInnerText(el) {
  if (el.innerText) {
    return `xpath=//${el.nodeName}[contains(.,'${el.innerText}')]`
  } else {
    return null
  }
}


var script = document.createElement('script');
script.src = 'https://code.jquery.com/jquery-3.4.1.min.js';
script.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(script);

var sheet = (function() {
  var style = document.createElement("style");
  style.appendChild(document.createTextNode(""));
  document.head.appendChild(style);
  return style.sheet;
})();

sheet.insertRule(".hova {background-color: pink;}", 0);

$('body').children().mouseover(function(e){

  e.stopPropagation();

  $(".hova").removeClass("hova");     
  $(e.target).addClass("hova");
}).mouseout(function(e) {
  $(e.target).removeClass("hova");
});



window.onclick = e => {
  //e.target.stopPropagation();
  console.log(e.target);
  //console.log("HERE1")
  //console.log(createXPathFromElement(e.target))
  //console.log(getFullName(e.target, 0))
  //console.log(xpathHref(e.target))
  //console.log(xpathLink(e.target))
  //console.log(xpathImg(e.target))
  //console.log(xpathInnerText(e.target))
  //console.log(xpathPosition(e))
  //console.log(xpathHrefid(e.target))
  //console.log(xpathIdRelative(e.target))
  //console.log(xpathIdRelativePartial(e.target))
  //console.log(xpathAttr(e.target))
  

  var document = e.target.ownerDocument;
  console.log("title="+document.title);
  var title = document.title
  sheet.deleteRule (0);
  var name = window.prompt("Add element with name",getFullName(e.target, 0));
  var i = 0;
  var locators = "";
  var locator = xpathHref(e.target);
  if(locator!=null){
    if(i==0){
      locators = locator;
      i++;
    }else{
      locators = locators + ",," + locator;
    }
  }

  var locator = xpathLink(e.target);
  if(locator!=null){
    if(i==0){
      locators = locator;
      i++;
    }else{
      locators = locators + ",," + locator;
    }
  }

  var locator = xpathImg(e.target);
  if(locator!=null){
    if(i==0){
      locators = locator;
      i++;
    }else{
      locators = locators + ",," + locator;
    }
  }

  var locator = xpathInnerText(e.target);
  if(locator!=null){
    if(i==0){
      locators = locator;
      i++;
    }else{
      locators = locators + ",," + locator;
    }
  }

  var locator = xpathPosition(e.target);
  if(locator!=null){
    if(i==0){
      locators = locator;
      i++;
    }else{
      locators = locators + ",," + locator;
    }
  }

  var locator = xpathHrefid(e.target);
  if(locator!=null){
    if(i==0){
      locators = locator;
      i++;
    }else{
      locators = locators + ",," + locator;
    }
  }

  var locator = xpathIdRelative(e.target);
  if(locator!=null){
    if(i==0){
      locators = locator;
      i++;
    }else{
      locators = locators + ",," + locator;
    }
  }

  var locator = xpathIdRelativePartial(e.target);
  if(locator!=null){
    if(i==0){
      locators = locator;
      i++;
    }else{
      locators = locators + ",," + locator;
    }
  }

  var locator = xpathAttr(e.target);
  if(locator!=null){
    if(i==0){
      locators = locator;
      i++;
    }else{
      locators = locators + ",," + locator;
    }
  }

  let headers = new Headers();

headers.append('Content-Type', 'application/json');
headers.append('Accept', 'application/json');
headers.append('Origin','http://localhost:5000');
headers.append('Access-Control-Allow-Origin', '*');

    

var formdata = new FormData();
formdata.append("pageTitle", title);
formdata.append("eleName", name);
formdata.append("locators", locators);

var requestOptions = {
    mode: "no-cors",
    method: 'POST',
  body: formdata,
  redirect: 'follow',
  headers: headers
};
if(name!=null){
fetch("http://127.0.0.1:5000/element", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));}
} 




