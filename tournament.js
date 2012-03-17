(function () {
    "use strict";
     var members,map,tree;

     function $(id) { return document.getElementById(id); };
     
     function init(){
         $('make').addEventListener("click",make);
         $('reset').addEventListener("click",clear);
         $('rename').addEventListener("click",rename);
         $('area').addEventListener("click",win);
     }

     function make_html(idx){
         var self = tree[idx];
         var child0 = tree[idx*2];
         var child1 = tree[idx*2+1];
         if (self == 0 || child0 != undefined || child1 != undefined) {
             return merge(idx, make_html(idx*2), make_html(idx*2+1));
         }
         var name = members[map[self - 1]];
         return {"pos": 0,
                 "list": [(tree[Math.floor(idx/2)] == self ? Kei.BH : Kei.H) +
                          Kei.Blank + "<a no="+ self +">" + name + "</a>"]};
     }

     function merge(node, a, b) {
         var self = tree[node];
         var new_a = merge_aux(self != 0 && self == tree[node*2], true, a);
         var new_b = merge_aux(self != 0 && self == tree[node*2+1], false, b);
         new_a.push( self != 0 ? (Kei.BH + Kei.BT) : (Kei.H + Kei.T));
         return {"pos": new_a.length - 1, "list": new_a.concat(new_b)};
     }

     function merge_aux(node_side_flag, uflag, elem) {
         var line,result = [];
         for (var i = 0;i < elem.list.length;i++){
             if (i < elem.pos) {
                 line = uflag ? Kei.Blank : (node_side_flag ? Kei.BV : Kei.V); 
             } else if (i === elem.pos) {
                 line = uflag ? (node_side_flag ? Kei.BF : Kei.F) :
                 (node_side_flag ? Kei.BL : Kei.L);
             } else {
                 line = uflag ? (node_side_flag ? Kei.BV : Kei.V) : Kei.Blank;
             }
             result.push(Kei.Blank + line + elem.list[i]);
         }
         return result;
     }
     
     function shuffle() {
         for (var i = 0;i < members.length;i++) map[i] = i;
         
         for (var i = 0;i < members.length - 1;i++){
             var a = Math.floor(Math.random() * (members.length - i));
             var t = map[i];
             map[i] = map[i + a];
             map[i + a] = t;
         }
         return map;
     }
     
     function make_tree(n,start,end){
         var size = end - start + 1;
         if (size == 1) { // leaf
             tree[n] = start;
         } else {
             var mid = Math.ceil(size/2);
             tree[n] = 0;
             make_tree(n*2,start,start+mid-1);
             make_tree(n*2+1,start+mid,end);
         }
     }

     function make() {
         update_members();
         shuffle();
         clear();
     }
     
     function clear() {
         tree = [];
         make_tree(1,1,members.length);
         $('area').innerHTML = make_html(1).list.join("<br />");
     }

     function rename() {
         update_members();
         $('area').innerHTML = make_html(1).list.join("<br />");
     }

     function update_members(){
         var pre_members = $('member').value.split("\n")
         members = pre_members.filter(function(e) {return (e != "");});
     }
     
     function win(ev) {
         var attr = ev.target.attributes;
         if (attr["no"] == undefined) return;
         var no = parseInt(attr["no"].nodeValue);
         var node = tree.lastIndexOf(no);
         for(;;){ 
             if (node == 0) break;
             if (tree[node] != no) {
                 tree[node] = no;
                 break;
             } 
             node = Math.floor(node / 2);
         }
         $('area').innerHTML = make_html(1).list.join("<br />");
     }
     
     window.onload = init;
}());