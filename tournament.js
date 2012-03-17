(function () {
     var members,map,tree;
     window.onload = init;

     function $(id) { return document.getElementById(id); };
     
     function init(){
         $('make').addEventListener("click",shuffle);
         $('reset').addEventListener("click",make);
         $('rename').addEventListener("click",
                                      function(){update_members();draw()});
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
         return {pos: 0,
                 line: [(tree[Math.floor(idx/2)] == self ? K.BH : K.H) +
                        K.Blank + "<a no="+ self +">" + name + "</a>"]};
     }

     function merge(node, a, b) {
         var self = tree[node];
         var new_a = merge_aux(self != 0 && self == tree[node*2], true, a);
         var new_b = merge_aux(self != 0 && self == tree[node*2+1], false, b);
         new_a.push( self != 0 ? (K.BH + K.BT) : (K.H + K.T));
         return {pos: new_a.length - 1, line: new_a.concat(new_b)};
     }

     function merge_aux(is_bold, up, elem) {
         var line,result = [];
         for (var i = 0;i < elem.line.length;i++){
             if (i < elem.pos) {
                 line = up ? K.Blank : (is_bold ? K.BV : K.V); 
             } else if (i === elem.pos) {
                 line = up ? (is_bold ? K.BF : K.F) : (is_bold ? K.BL : K.L);
             } else {
                 line = up ? (is_bold ? K.BV : K.V) : K.Blank;
             }
             result.push(K.Blank + line + elem.line[i]);
         }
         return result;
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

     function draw(){ $('area').innerHTML = make_html(1).line.join("<br />"); }

     function shuffle() {
         update_members();
         map = [];
         for (var i = 0;i < members.length;i++) map[i] = i;
         for (var i = 0;i < members.length - 1;i++) {
             var a = Math.floor(Math.random() * (members.length - i));
             var t = map[i];
             map[i] = map[i + a];
             map[i + a] = t;
         }
         make();
     }

     function make() {
         tree = [];
         make_tree(1,1,members.length);
         draw();
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
         draw();
     }
}());