import{E as pt,V as A,M as Ee,T as we,S as tt,Q as it,a as D,R as gt,P as vt,b as xt,B as ft,c as Mt,d as Tt,O as bt,F as st,e as Y,U as ie,W as Ce,H as De,N as te,C as St,f as Fe,g as Qe,D as dt,h as Ke,i as yt,A as He,Z as Ge,j as at,k as ot,l as Pt,m as Et,n as wt,o as Ct,p as rt,q as Dt,r as Rt,s as At,t as _t,u as Nt,L as Ut,v as Ot,w as It,x as Lt,y as zt,z as jt,G as Ft}from"./three-core-xy1a73Vc.js";const nt={type:"change"},Je={type:"start"},lt={type:"end"},Ye=new gt,ct=new vt,Bt=Math.cos(70*xt.DEG2RAD);class Jt extends pt{constructor(e,s){super(),this.object=e,this.domElement=s,this.domElement.style.touchAction="none",this.enabled=!0,this.target=new A,this.cursor=new A,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Ee.ROTATE,MIDDLE:Ee.DOLLY,RIGHT:Ee.PAN},this.touches={ONE:we.ROTATE,TWO:we.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this.getPolarAngle=function(){return n.phi},this.getAzimuthalAngle=function(){return n.theta},this.getDistance=function(){return this.object.position.distanceTo(this.target)},this.listenToKeyEvents=function(i){i.addEventListener("keydown",ce),this._domElementKeyEvents=i},this.stopListenToKeyEvents=function(){this._domElementKeyEvents.removeEventListener("keydown",ce),this._domElementKeyEvents=null},this.saveState=function(){t.target0.copy(t.target),t.position0.copy(t.object.position),t.zoom0=t.object.zoom},this.reset=function(){t.target.copy(t.target0),t.object.position.copy(t.position0),t.object.zoom=t.zoom0,t.object.updateProjectionMatrix(),t.dispatchEvent(nt),t.update(),a=o.NONE},this.update=(function(){const i=new A,c=new it().setFromUnitVectors(e.up,new A(0,1,0)),g=c.clone().invert(),M=new A,z=new it,F=new A,U=2*Math.PI;return function(fe=null){const re=t.object.position;i.copy(re).sub(t.target),i.applyQuaternion(c),n.setFromVector3(i),t.autoRotate&&a===o.NONE&&b(C(fe)),t.enableDamping?(n.theta+=h.theta*t.dampingFactor,n.phi+=h.phi*t.dampingFactor):(n.theta+=h.theta,n.phi+=h.phi);let J=t.minAzimuthAngle,ee=t.maxAzimuthAngle;isFinite(J)&&isFinite(ee)&&(J<-Math.PI?J+=U:J>Math.PI&&(J-=U),ee<-Math.PI?ee+=U:ee>Math.PI&&(ee-=U),J<=ee?n.theta=Math.max(J,Math.min(ee,n.theta)):n.theta=n.theta>(J+ee)/2?Math.max(J,n.theta):Math.min(ee,n.theta)),n.phi=Math.max(t.minPolarAngle,Math.min(t.maxPolarAngle,n.phi)),n.makeSafe(),t.enableDamping===!0?t.target.addScaledVector(l,t.dampingFactor):t.target.add(l),t.target.sub(t.cursor),t.target.clampLength(t.minTargetRadius,t.maxTargetRadius),t.target.add(t.cursor),t.zoomToCursor&&N||t.object.isOrthographicCamera?n.radius=_(n.radius):n.radius=_(n.radius*u),i.setFromSpherical(n),i.applyQuaternion(g),re.copy(t.target).add(i),t.object.lookAt(t.target),t.enableDamping===!0?(h.theta*=1-t.dampingFactor,h.phi*=1-t.dampingFactor,l.multiplyScalar(1-t.dampingFactor)):(h.set(0,0,0),l.set(0,0,0));let $e=!1;if(t.zoomToCursor&&N){let Le=null;if(t.object.isPerspectiveCamera){const ze=i.length();Le=_(ze*u);const ke=ze-Le;t.object.position.addScaledVector(R,ke),t.object.updateMatrixWorld()}else if(t.object.isOrthographicCamera){const ze=new A(w.x,w.y,0);ze.unproject(t.object),t.object.zoom=Math.max(t.minZoom,Math.min(t.maxZoom,t.object.zoom/u)),t.object.updateProjectionMatrix(),$e=!0;const ke=new A(w.x,w.y,0);ke.unproject(t.object),t.object.position.sub(ke).add(ze),t.object.updateMatrixWorld(),Le=i.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),t.zoomToCursor=!1;Le!==null&&(this.screenSpacePanning?t.target.set(0,0,-1).transformDirection(t.object.matrix).multiplyScalar(Le).add(t.object.position):(Ye.origin.copy(t.object.position),Ye.direction.set(0,0,-1).transformDirection(t.object.matrix),Math.abs(t.object.up.dot(Ye.direction))<Bt?e.lookAt(t.target):(ct.setFromNormalAndCoplanarPoint(t.object.up,t.target),Ye.intersectPlane(ct,t.target))))}else t.object.isOrthographicCamera&&(t.object.zoom=Math.max(t.minZoom,Math.min(t.maxZoom,t.object.zoom/u)),t.object.updateProjectionMatrix(),$e=!0);return u=1,N=!1,$e||M.distanceToSquared(t.object.position)>r||8*(1-z.dot(t.object.quaternion))>r||F.distanceToSquared(t.target)>0?(t.dispatchEvent(nt),M.copy(t.object.position),z.copy(t.object.quaternion),F.copy(t.target),!0):!1}})(),this.dispose=function(){t.domElement.removeEventListener("contextmenu",ye),t.domElement.removeEventListener("pointerdown",be),t.domElement.removeEventListener("pointercancel",$),t.domElement.removeEventListener("wheel",Se),t.domElement.removeEventListener("pointermove",le),t.domElement.removeEventListener("pointerup",$),t._domElementKeyEvents!==null&&(t._domElementKeyEvents.removeEventListener("keydown",ce),t._domElementKeyEvents=null)};const t=this,o={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6};let a=o.NONE;const r=1e-6,n=new tt,h=new tt;let u=1;const l=new A,d=new D,p=new D,f=new D,v=new D,S=new D,O=new D,I=new D,E=new D,y=new D,R=new A,w=new D;let N=!1;const x=[],L={};function C(i){return i!==null?2*Math.PI/60*t.autoRotateSpeed*i:2*Math.PI/60/60*t.autoRotateSpeed}function T(i){const c=Math.abs(i)/(100*(window.devicePixelRatio|0));return Math.pow(.95,t.zoomSpeed*c)}function b(i){h.theta-=i}function P(i){h.phi-=i}const j=(function(){const i=new A;return function(g,M){i.setFromMatrixColumn(M,0),i.multiplyScalar(-g),l.add(i)}})(),se=(function(){const i=new A;return function(g,M){t.screenSpacePanning===!0?i.setFromMatrixColumn(M,1):(i.setFromMatrixColumn(M,0),i.crossVectors(t.object.up,i)),i.multiplyScalar(g),l.add(i)}})(),B=(function(){const i=new A;return function(g,M){const z=t.domElement;if(t.object.isPerspectiveCamera){const F=t.object.position;i.copy(F).sub(t.target);let U=i.length();U*=Math.tan(t.object.fov/2*Math.PI/180),j(2*g*U/z.clientHeight,t.object.matrix),se(2*M*U/z.clientHeight,t.object.matrix)}else t.object.isOrthographicCamera?(j(g*(t.object.right-t.object.left)/t.object.zoom/z.clientWidth,t.object.matrix),se(M*(t.object.top-t.object.bottom)/t.object.zoom/z.clientHeight,t.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),t.enablePan=!1)}})();function Q(i){t.object.isPerspectiveCamera||t.object.isOrthographicCamera?u/=i:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),t.enableZoom=!1)}function ae(i){t.object.isPerspectiveCamera||t.object.isOrthographicCamera?u*=i:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),t.enableZoom=!1)}function K(i,c){if(!t.zoomToCursor)return;N=!0;const g=t.domElement.getBoundingClientRect(),M=i-g.left,z=c-g.top,F=g.width,U=g.height;w.x=M/F*2-1,w.y=-(z/U)*2+1,R.set(w.x,w.y,1).unproject(t.object).sub(t.object.position).normalize()}function _(i){return Math.max(t.minDistance,Math.min(t.maxDistance,i))}function Z(i){d.set(i.clientX,i.clientY)}function q(i){K(i.clientX,i.clientX),I.set(i.clientX,i.clientY)}function W(i){v.set(i.clientX,i.clientY)}function me(i){p.set(i.clientX,i.clientY),f.subVectors(p,d).multiplyScalar(t.rotateSpeed);const c=t.domElement;b(2*Math.PI*f.x/c.clientHeight),P(2*Math.PI*f.y/c.clientHeight),d.copy(p),t.update()}function pe(i){E.set(i.clientX,i.clientY),y.subVectors(E,I),y.y>0?Q(T(y.y)):y.y<0&&ae(T(y.y)),I.copy(E),t.update()}function ge(i){S.set(i.clientX,i.clientY),O.subVectors(S,v).multiplyScalar(t.panSpeed),B(O.x,O.y),v.copy(S),t.update()}function ve(i){K(i.clientX,i.clientY),i.deltaY<0?ae(T(i.deltaY)):i.deltaY>0&&Q(T(i.deltaY)),t.update()}function X(i){let c=!1;switch(i.code){case t.keys.UP:i.ctrlKey||i.metaKey||i.shiftKey?P(2*Math.PI*t.rotateSpeed/t.domElement.clientHeight):B(0,t.keyPanSpeed),c=!0;break;case t.keys.BOTTOM:i.ctrlKey||i.metaKey||i.shiftKey?P(-2*Math.PI*t.rotateSpeed/t.domElement.clientHeight):B(0,-t.keyPanSpeed),c=!0;break;case t.keys.LEFT:i.ctrlKey||i.metaKey||i.shiftKey?b(2*Math.PI*t.rotateSpeed/t.domElement.clientHeight):B(t.keyPanSpeed,0),c=!0;break;case t.keys.RIGHT:i.ctrlKey||i.metaKey||i.shiftKey?b(-2*Math.PI*t.rotateSpeed/t.domElement.clientHeight):B(-t.keyPanSpeed,0),c=!0;break}c&&(i.preventDefault(),t.update())}function k(i){if(x.length===1)d.set(i.pageX,i.pageY);else{const c=V(i),g=.5*(i.pageX+c.x),M=.5*(i.pageY+c.y);d.set(g,M)}}function H(i){if(x.length===1)v.set(i.pageX,i.pageY);else{const c=V(i),g=.5*(i.pageX+c.x),M=.5*(i.pageY+c.y);v.set(g,M)}}function G(i){const c=V(i),g=i.pageX-c.x,M=i.pageY-c.y,z=Math.sqrt(g*g+M*M);I.set(0,z)}function Ve(i){t.enableZoom&&G(i),t.enablePan&&H(i)}function Re(i){t.enableZoom&&G(i),t.enableRotate&&k(i)}function xe(i){if(x.length==1)p.set(i.pageX,i.pageY);else{const g=V(i),M=.5*(i.pageX+g.x),z=.5*(i.pageY+g.y);p.set(M,z)}f.subVectors(p,d).multiplyScalar(t.rotateSpeed);const c=t.domElement;b(2*Math.PI*f.x/c.clientHeight),P(2*Math.PI*f.y/c.clientHeight),d.copy(p)}function Me(i){if(x.length===1)S.set(i.pageX,i.pageY);else{const c=V(i),g=.5*(i.pageX+c.x),M=.5*(i.pageY+c.y);S.set(g,M)}O.subVectors(S,v).multiplyScalar(t.panSpeed),B(O.x,O.y),v.copy(S)}function Te(i){const c=V(i),g=i.pageX-c.x,M=i.pageY-c.y,z=Math.sqrt(g*g+M*M);E.set(0,z),y.set(0,Math.pow(E.y/I.y,t.zoomSpeed)),Q(y.y),I.copy(E);const F=(i.pageX+c.x)*.5,U=(i.pageY+c.y)*.5;K(F,U)}function Ae(i){t.enableZoom&&Te(i),t.enablePan&&Me(i)}function _e(i){t.enableZoom&&Te(i),t.enableRotate&&xe(i)}function be(i){t.enabled!==!1&&(x.length===0&&(t.domElement.setPointerCapture(i.pointerId),t.domElement.addEventListener("pointermove",le),t.domElement.addEventListener("pointerup",$)),ue(i),i.pointerType==="touch"?Oe(i):Ne(i))}function le(i){t.enabled!==!1&&(i.pointerType==="touch"?Ie(i):Ue(i))}function $(i){he(i),x.length===0&&(t.domElement.releasePointerCapture(i.pointerId),t.domElement.removeEventListener("pointermove",le),t.domElement.removeEventListener("pointerup",$)),t.dispatchEvent(lt),a=o.NONE}function Ne(i){let c;switch(i.button){case 0:c=t.mouseButtons.LEFT;break;case 1:c=t.mouseButtons.MIDDLE;break;case 2:c=t.mouseButtons.RIGHT;break;default:c=-1}switch(c){case Ee.DOLLY:if(t.enableZoom===!1)return;q(i),a=o.DOLLY;break;case Ee.ROTATE:if(i.ctrlKey||i.metaKey||i.shiftKey){if(t.enablePan===!1)return;W(i),a=o.PAN}else{if(t.enableRotate===!1)return;Z(i),a=o.ROTATE}break;case Ee.PAN:if(i.ctrlKey||i.metaKey||i.shiftKey){if(t.enableRotate===!1)return;Z(i),a=o.ROTATE}else{if(t.enablePan===!1)return;W(i),a=o.PAN}break;default:a=o.NONE}a!==o.NONE&&t.dispatchEvent(Je)}function Ue(i){switch(a){case o.ROTATE:if(t.enableRotate===!1)return;me(i);break;case o.DOLLY:if(t.enableZoom===!1)return;pe(i);break;case o.PAN:if(t.enablePan===!1)return;ge(i);break}}function Se(i){t.enabled===!1||t.enableZoom===!1||a!==o.NONE||(i.preventDefault(),t.dispatchEvent(Je),ve(i),t.dispatchEvent(lt))}function ce(i){t.enabled===!1||t.enablePan===!1||X(i)}function Oe(i){switch(oe(i),x.length){case 1:switch(t.touches.ONE){case we.ROTATE:if(t.enableRotate===!1)return;k(i),a=o.TOUCH_ROTATE;break;case we.PAN:if(t.enablePan===!1)return;H(i),a=o.TOUCH_PAN;break;default:a=o.NONE}break;case 2:switch(t.touches.TWO){case we.DOLLY_PAN:if(t.enableZoom===!1&&t.enablePan===!1)return;Ve(i),a=o.TOUCH_DOLLY_PAN;break;case we.DOLLY_ROTATE:if(t.enableZoom===!1&&t.enableRotate===!1)return;Re(i),a=o.TOUCH_DOLLY_ROTATE;break;default:a=o.NONE}break;default:a=o.NONE}a!==o.NONE&&t.dispatchEvent(Je)}function Ie(i){switch(oe(i),a){case o.TOUCH_ROTATE:if(t.enableRotate===!1)return;xe(i),t.update();break;case o.TOUCH_PAN:if(t.enablePan===!1)return;Me(i),t.update();break;case o.TOUCH_DOLLY_PAN:if(t.enableZoom===!1&&t.enablePan===!1)return;Ae(i),t.update();break;case o.TOUCH_DOLLY_ROTATE:if(t.enableZoom===!1&&t.enableRotate===!1)return;_e(i),t.update();break;default:a=o.NONE}}function ye(i){t.enabled!==!1&&i.preventDefault()}function ue(i){x.push(i.pointerId)}function he(i){delete L[i.pointerId];for(let c=0;c<x.length;c++)if(x[c]==i.pointerId){x.splice(c,1);return}}function oe(i){let c=L[i.pointerId];c===void 0&&(c=new D,L[i.pointerId]=c),c.set(i.pageX,i.pageY)}function V(i){const c=i.pointerId===x[0]?x[1]:x[0];return L[c]}t.domElement.addEventListener("contextmenu",ye),t.domElement.addEventListener("pointerdown",be),t.domElement.addEventListener("pointercancel",$),t.domElement.addEventListener("wheel",Se,{passive:!1}),this.update()}}function ei(m,e=!1){const s=m[0].index!==null,t=new Set(Object.keys(m[0].attributes)),o=new Set(Object.keys(m[0].morphAttributes)),a={},r={},n=m[0].morphTargetsRelative,h=new ft;let u=0;for(let l=0;l<m.length;++l){const d=m[l];let p=0;if(s!==(d.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+l+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(const f in d.attributes){if(!t.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+l+'. All geometries must have compatible attributes; make sure "'+f+'" attribute exists among all geometries, or in none of them.'),null;a[f]===void 0&&(a[f]=[]),a[f].push(d.attributes[f]),p++}if(p!==t.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+l+". Make sure all geometries have the same number of attributes."),null;if(n!==d.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+l+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(const f in d.morphAttributes){if(!o.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+l+".  .morphAttributes must be consistent throughout all geometries."),null;r[f]===void 0&&(r[f]=[]),r[f].push(d.morphAttributes[f])}if(e){let f;if(s)f=d.index.count;else if(d.attributes.position!==void 0)f=d.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+l+". The geometry must have either an index or a position attribute"),null;h.addGroup(u,f,l),u+=f}}if(s){let l=0;const d=[];for(let p=0;p<m.length;++p){const f=m[p].index;for(let v=0;v<f.count;++v)d.push(f.getX(v)+l);l+=m[p].attributes.position.count}h.setIndex(d)}for(const l in a){const d=ut(a[l]);if(!d)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+l+" attribute."),null;h.setAttribute(l,d)}for(const l in r){const d=r[l][0].length;if(d===0)break;h.morphAttributes=h.morphAttributes||{},h.morphAttributes[l]=[];for(let p=0;p<d;++p){const f=[];for(let S=0;S<r[l].length;++S)f.push(r[l][S][p]);const v=ut(f);if(!v)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+l+" morphAttribute."),null;h.morphAttributes[l].push(v)}}return h}function ut(m){let e,s,t,o=-1,a=0;for(let u=0;u<m.length;++u){const l=m[u];if(l.isInterleavedBufferAttribute)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. InterleavedBufferAttributes are not supported."),null;if(e===void 0&&(e=l.array.constructor),e!==l.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(s===void 0&&(s=l.itemSize),s!==l.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(t===void 0&&(t=l.normalized),t!==l.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(o===-1&&(o=l.gpuType),o!==l.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;a+=l.array.length}const r=new e(a);let n=0;for(let u=0;u<m.length;++u)r.set(m[u].array,n),n+=m[u].array.length;const h=new Mt(r,s,t);return o!==void 0&&(h.gpuType=o),h}const je={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};class de{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const Vt=new bt(-1,1,1,-1,0,1);class kt extends ft{constructor(){super(),this.setAttribute("position",new st([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new st([0,2,0,0,2,0],2))}}const Ht=new kt;class qe{constructor(e){this._mesh=new Tt(Ht,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,Vt)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class Gt extends de{constructor(e,s){super(),this.textureID=s!==void 0?s:"tDiffuse",e instanceof Y?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=ie.clone(e.uniforms),this.material=new Y({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this.fsQuad=new qe(this.material)}render(e,s,t){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=t.texture),this.fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(s),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this.fsQuad.render(e))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}class ht extends de{constructor(e,s){super(),this.scene=e,this.camera=s,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,s,t){const o=e.getContext(),a=e.state;a.buffers.color.setMask(!1),a.buffers.depth.setMask(!1),a.buffers.color.setLocked(!0),a.buffers.depth.setLocked(!0);let r,n;this.inverse?(r=0,n=1):(r=1,n=0),a.buffers.stencil.setTest(!0),a.buffers.stencil.setOp(o.REPLACE,o.REPLACE,o.REPLACE),a.buffers.stencil.setFunc(o.ALWAYS,r,4294967295),a.buffers.stencil.setClear(n),a.buffers.stencil.setLocked(!0),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(s),this.clear&&e.clear(),e.render(this.scene,this.camera),a.buffers.color.setLocked(!1),a.buffers.depth.setLocked(!1),a.buffers.color.setMask(!0),a.buffers.depth.setMask(!0),a.buffers.stencil.setLocked(!1),a.buffers.stencil.setFunc(o.EQUAL,1,4294967295),a.buffers.stencil.setOp(o.KEEP,o.KEEP,o.KEEP),a.buffers.stencil.setLocked(!0)}}class Yt extends de{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class ti{constructor(e,s){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),s===void 0){const t=e.getSize(new D);this._width=t.width,this._height=t.height,s=new Ce(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:De}),s.texture.name="EffectComposer.rt1"}else this._width=s.width,this._height=s.height;this.renderTarget1=s,this.renderTarget2=s.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Gt(je),this.copyPass.material.blending=te,this.clock=new St}swapBuffers(){const e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,s){this.passes.splice(s,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){const s=this.passes.indexOf(e);s!==-1&&this.passes.splice(s,1)}isLastEnabledPass(e){for(let s=e+1;s<this.passes.length;s++)if(this.passes[s].enabled)return!1;return!0}render(e){e===void 0&&(e=this.clock.getDelta());const s=this.renderer.getRenderTarget();let t=!1;for(let o=0,a=this.passes.length;o<a;o++){const r=this.passes[o];if(r.enabled!==!1){if(r.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(o),r.render(this.renderer,this.writeBuffer,this.readBuffer,e,t),r.needsSwap){if(t){const n=this.renderer.getContext(),h=this.renderer.state.buffers.stencil;h.setFunc(n.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),h.setFunc(n.EQUAL,1,4294967295)}this.swapBuffers()}ht!==void 0&&(r instanceof ht?t=!0:r instanceof Yt&&(t=!1))}}this.renderer.setRenderTarget(s)}reset(e){if(e===void 0){const s=this.renderer.getSize(new D);this._pixelRatio=this.renderer.getPixelRatio(),this._width=s.width,this._height=s.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,s){this._width=e,this._height=s;const t=this._width*this._pixelRatio,o=this._height*this._pixelRatio;this.renderTarget1.setSize(t,o),this.renderTarget2.setSize(t,o);for(let a=0;a<this.passes.length;a++)this.passes[a].setSize(t,o)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class ii extends de{constructor(e,s,t=null,o=null,a=null){super(),this.scene=e,this.camera=s,this.overrideMaterial=t,this.clearColor=o,this.clearAlpha=a,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new Fe}render(e,s,t){const o=e.autoClear;e.autoClear=!1;let a,r;this.overrideMaterial!==null&&(r=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor)),this.clearAlpha!==null&&(a=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:t),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(a),this.overrideMaterial!==null&&(this.scene.overrideMaterial=r),e.autoClear=o}}const Ze={defines:{PERSPECTIVE_CAMERA:1,SAMPLES:16,NORMAL_VECTOR_TYPE:1,DEPTH_SWIZZLING:"x",SCREEN_SPACE_RADIUS:0,SCREEN_SPACE_RADIUS_SCALE:100,SCENE_CLIP_BOX:0},uniforms:{tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new D},cameraNear:{value:null},cameraFar:{value:null},cameraProjectionMatrix:{value:new Qe},cameraProjectionMatrixInverse:{value:new Qe},cameraWorldMatrix:{value:new Qe},radius:{value:.25},distanceExponent:{value:1},thickness:{value:1},distanceFallOff:{value:1},scale:{value:1},sceneBoxMin:{value:new A(-1,-1,-1)},sceneBoxMax:{value:new A(1,1,1)}},vertexShader:`

		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		varying vec2 vUv;
		uniform highp sampler2D tNormal;
		uniform highp sampler2D tDepth;
		uniform sampler2D tNoise;
		uniform vec2 resolution;
		uniform float cameraNear;
		uniform float cameraFar;
		uniform mat4 cameraProjectionMatrix;
		uniform mat4 cameraProjectionMatrixInverse;		
		uniform mat4 cameraWorldMatrix;
		uniform float radius;
		uniform float distanceExponent;
		uniform float thickness;
		uniform float distanceFallOff;
		uniform float scale;
		#if SCENE_CLIP_BOX == 1
			uniform vec3 sceneBoxMin;
			uniform vec3 sceneBoxMax;
		#endif
		
		#include <common>
		#include <packing>

		#ifndef FRAGMENT_OUTPUT
		#define FRAGMENT_OUTPUT vec4(vec3(ao), 1.)
		#endif

		vec3 getViewPosition(const in vec2 screenPosition, const in float depth) {
			vec4 clipSpacePosition = vec4(vec3(screenPosition, depth) * 2.0 - 1.0, 1.0);
			vec4 viewSpacePosition = cameraProjectionMatrixInverse * clipSpacePosition;
			return viewSpacePosition.xyz / viewSpacePosition.w;
		}

		float getDepth(const vec2 uv) {  
			return textureLod(tDepth, uv.xy, 0.0).DEPTH_SWIZZLING;
		}

		float fetchDepth(const ivec2 uv) {   
			return texelFetch(tDepth, uv.xy, 0).DEPTH_SWIZZLING;
		}

		float getViewZ(const in float depth) {
			#if PERSPECTIVE_CAMERA == 1
				return perspectiveDepthToViewZ(depth, cameraNear, cameraFar);
			#else
				return orthographicDepthToViewZ(depth, cameraNear, cameraFar);
			#endif
		}

		vec3 computeNormalFromDepth(const vec2 uv) {
			vec2 size = vec2(textureSize(tDepth, 0));
			ivec2 p = ivec2(uv * size);
			float c0 = fetchDepth(p);
			float l2 = fetchDepth(p - ivec2(2, 0));
			float l1 = fetchDepth(p - ivec2(1, 0));
			float r1 = fetchDepth(p + ivec2(1, 0));
			float r2 = fetchDepth(p + ivec2(2, 0));
			float b2 = fetchDepth(p - ivec2(0, 2));
			float b1 = fetchDepth(p - ivec2(0, 1));
			float t1 = fetchDepth(p + ivec2(0, 1));
			float t2 = fetchDepth(p + ivec2(0, 2));
			float dl = abs((2.0 * l1 - l2) - c0);
			float dr = abs((2.0 * r1 - r2) - c0);
			float db = abs((2.0 * b1 - b2) - c0);
			float dt = abs((2.0 * t1 - t2) - c0);
			vec3 ce = getViewPosition(uv, c0).xyz;
			vec3 dpdx = (dl < dr) ? ce - getViewPosition((uv - vec2(1.0 / size.x, 0.0)), l1).xyz : -ce + getViewPosition((uv + vec2(1.0 / size.x, 0.0)), r1).xyz;
			vec3 dpdy = (db < dt) ? ce - getViewPosition((uv - vec2(0.0, 1.0 / size.y)), b1).xyz : -ce + getViewPosition((uv + vec2(0.0, 1.0 / size.y)), t1).xyz;
			return normalize(cross(dpdx, dpdy));
		}

		vec3 getViewNormal(const vec2 uv) {
			#if NORMAL_VECTOR_TYPE == 2
				return normalize(textureLod(tNormal, uv, 0.).rgb);
			#elif NORMAL_VECTOR_TYPE == 1
				return unpackRGBToNormal(textureLod(tNormal, uv, 0.).rgb);
			#else
				return computeNormalFromDepth(uv);
			#endif
		}

		vec3 getSceneUvAndDepth(vec3 sampleViewPos) {
			vec4 sampleClipPos = cameraProjectionMatrix * vec4(sampleViewPos, 1.);
			vec2 sampleUv = sampleClipPos.xy / sampleClipPos.w * 0.5 + 0.5;
			float sampleSceneDepth = getDepth(sampleUv);
			return vec3(sampleUv, sampleSceneDepth);
		}
		
		void main() {
			float depth = getDepth(vUv.xy);
			if (depth >= 1.0) {
				discard;
				return;
			}
			vec3 viewPos = getViewPosition(vUv, depth);
			vec3 viewNormal = getViewNormal(vUv);

			float radiusToUse = radius;
			float distanceFalloffToUse = thickness;
			#if SCREEN_SPACE_RADIUS == 1
				float radiusScale = getViewPosition(vec2(0.5 + float(SCREEN_SPACE_RADIUS_SCALE) / resolution.x, 0.0), depth).x;
				radiusToUse *= radiusScale;
				distanceFalloffToUse *= radiusScale;
			#endif

			#if SCENE_CLIP_BOX == 1
				vec3 worldPos = (cameraWorldMatrix * vec4(viewPos, 1.0)).xyz;
				float boxDistance = length(max(vec3(0.0), max(sceneBoxMin - worldPos, worldPos - sceneBoxMax)));
				if (boxDistance > radiusToUse) {
					discard;
					return;
				}
			#endif
			
			vec2 noiseResolution = vec2(textureSize(tNoise, 0));
			vec2 noiseUv = vUv * resolution / noiseResolution;
			vec4 noiseTexel = textureLod(tNoise, noiseUv, 0.0);
			vec3 randomVec = noiseTexel.xyz * 2.0 - 1.0;
			vec3 tangent = normalize(vec3(randomVec.xy, 0.));
			vec3 bitangent = vec3(-tangent.y, tangent.x, 0.);
			mat3 kernelMatrix = mat3(tangent, bitangent, vec3(0., 0., 1.));

			const int DIRECTIONS = SAMPLES < 30 ? 3 : 5;
			const int STEPS = (SAMPLES + DIRECTIONS - 1) / DIRECTIONS;
			float ao = 0.0, totalWeight = 0.0;
			for (int i = 0; i < DIRECTIONS; ++i) {
				
				float angle = float(i) / float(DIRECTIONS) * PI;
				vec4 sampleDir = vec4(cos(angle), sin(angle), 0., 0.5 + 0.5 * noiseTexel.w); 
				sampleDir.xyz = normalize(kernelMatrix * sampleDir.xyz);

				vec3 viewDir = normalize(-viewPos.xyz);
				vec3 sliceBitangent = normalize(cross(sampleDir.xyz, viewDir));
				vec3 sliceTangent = cross(sliceBitangent, viewDir);
				vec3 normalInSlice = normalize(viewNormal - sliceBitangent * dot(viewNormal, sliceBitangent));
				
				vec3 tangentToNormalInSlice = cross(normalInSlice, sliceBitangent);
				vec2 cosHorizons = vec2(dot(viewDir, tangentToNormalInSlice), dot(viewDir, -tangentToNormalInSlice));
				
				for (int j = 0; j < STEPS; ++j) {
					vec3 sampleViewOffset = sampleDir.xyz * radiusToUse * sampleDir.w * pow(float(j + 1) / float(STEPS), distanceExponent);	

					vec3 sampleSceneUvDepth = getSceneUvAndDepth(viewPos + sampleViewOffset);
					vec3 sampleSceneViewPos = getViewPosition(sampleSceneUvDepth.xy, sampleSceneUvDepth.z);
					vec3 viewDelta = sampleSceneViewPos - viewPos;
					if (abs(viewDelta.z) < thickness) {
						float sampleCosHorizon = dot(viewDir, normalize(viewDelta));
						cosHorizons.x += max(0., (sampleCosHorizon - cosHorizons.x) * mix(1., 2. / float(j + 2), distanceFallOff));
					}		

					sampleSceneUvDepth = getSceneUvAndDepth(viewPos - sampleViewOffset);
					sampleSceneViewPos = getViewPosition(sampleSceneUvDepth.xy, sampleSceneUvDepth.z);
					viewDelta = sampleSceneViewPos - viewPos;
					if (abs(viewDelta.z) < thickness) {
						float sampleCosHorizon = dot(viewDir, normalize(viewDelta));
						cosHorizons.y += max(0., (sampleCosHorizon - cosHorizons.y) * mix(1., 2. / float(j + 2), distanceFallOff));
					}
				}

				vec2 sinHorizons = sqrt(1. - cosHorizons * cosHorizons);
				float nx = dot(normalInSlice, sliceTangent);
				float ny = dot(normalInSlice, viewDir);
				float nxb = 1. / 2. * (acos(cosHorizons.y) - acos(cosHorizons.x) + sinHorizons.x * cosHorizons.x - sinHorizons.y * cosHorizons.y);
				float nyb = 1. / 2. * (2. - cosHorizons.x * cosHorizons.x - cosHorizons.y * cosHorizons.y);
				float occlusion = nx * nxb + ny * nyb;
				ao += occlusion;
			}

			ao = clamp(ao / float(DIRECTIONS), 0., 1.);		
		#if SCENE_CLIP_BOX == 1
			ao = mix(ao, 1., smoothstep(0., radiusToUse, boxDistance));
		#endif
			ao = pow(ao, scale);

			gl_FragColor = FRAGMENT_OUTPUT;
		}`},We={defines:{PERSPECTIVE_CAMERA:1},uniforms:{tDepth:{value:null},cameraNear:{value:null},cameraFar:{value:null}},vertexShader:`
		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		uniform sampler2D tDepth;
		uniform float cameraNear;
		uniform float cameraFar;
		varying vec2 vUv;

		#include <packing>

		float getLinearDepth( const in vec2 screenPosition ) {
			#if PERSPECTIVE_CAMERA == 1
				float fragCoordZ = texture2D( tDepth, screenPosition ).x;
				float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
				return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
			#else
				return texture2D( tDepth, screenPosition ).x;
			#endif
		}

		void main() {
			float depth = getLinearDepth( vUv );
			gl_FragColor = vec4( vec3( 1.0 - depth ), 1.0 );

		}`},et={uniforms:{tDiffuse:{value:null},intensity:{value:1}},vertexShader:`
		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		uniform float intensity;
		uniform sampler2D tDiffuse;
		varying vec2 vUv;

		void main() {
			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = vec4(mix(vec3(1.), texel.rgb, intensity), texel.a);
		}`};function Zt(m=5){const e=Math.floor(m)%2===0?Math.floor(m)+1:Math.floor(m),s=Wt(e),t=s.length,o=new Uint8Array(t*4);for(let r=0;r<t;++r){const n=s[r],h=2*Math.PI*n/t,u=new A(Math.cos(h),Math.sin(h),0).normalize();o[r*4]=(u.x*.5+.5)*255,o[r*4+1]=(u.y*.5+.5)*255,o[r*4+2]=127,o[r*4+3]=255}const a=new dt(o,e,e);return a.wrapS=Ke,a.wrapT=Ke,a.needsUpdate=!0,a}function Wt(m){const e=Math.floor(m)%2===0?Math.floor(m)+1:Math.floor(m),s=e*e,t=Array(s).fill(0);let o=Math.floor(e/2),a=e-1;for(let r=1;r<=s;){if(o===-1&&a===e?(a=e-2,o=0):(a===e&&(a=0),o<0&&(o=e-1)),t[o*e+a]!==0){a-=2,o++;continue}else t[o*e+a]=r++;a++,o--}return t}const Xe={defines:{SAMPLES:16,SAMPLE_VECTORS:mt(16,2,1),NORMAL_VECTOR_TYPE:1,DEPTH_VALUE_SOURCE:0},uniforms:{tDiffuse:{value:null},tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new D},cameraProjectionMatrixInverse:{value:new Qe},lumaPhi:{value:5},depthPhi:{value:5},normalPhi:{value:5},radius:{value:4},index:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`

		varying vec2 vUv;

		uniform sampler2D tDiffuse;
		uniform sampler2D tNormal;
		uniform sampler2D tDepth;
		uniform sampler2D tNoise;
		uniform vec2 resolution;
		uniform mat4 cameraProjectionMatrixInverse;
		uniform float lumaPhi;
		uniform float depthPhi;
		uniform float normalPhi;
		uniform float radius;
		uniform int index;
		
		#include <common>
		#include <packing>

		#ifndef SAMPLE_LUMINANCE
		#define SAMPLE_LUMINANCE dot(vec3(0.2125, 0.7154, 0.0721), a)
		#endif

		#ifndef FRAGMENT_OUTPUT
		#define FRAGMENT_OUTPUT vec4(denoised, 1.)
		#endif

		float getLuminance(const in vec3 a) {
			return SAMPLE_LUMINANCE;
		}

		const vec3 poissonDisk[SAMPLES] = SAMPLE_VECTORS;

		vec3 getViewPosition(const in vec2 screenPosition, const in float depth) {
			vec4 clipSpacePosition = vec4(vec3(screenPosition, depth) * 2.0 - 1.0, 1.0);
			vec4 viewSpacePosition = cameraProjectionMatrixInverse * clipSpacePosition;
			return viewSpacePosition.xyz / viewSpacePosition.w;
		}
		
		float getDepth(const vec2 uv) {
		#if DEPTH_VALUE_SOURCE == 1    
			return textureLod(tDepth, uv.xy, 0.0).a;
		#else
			return textureLod(tDepth, uv.xy, 0.0).r;
		#endif
		}

		float fetchDepth(const ivec2 uv) {
			#if DEPTH_VALUE_SOURCE == 1    
				return texelFetch(tDepth, uv.xy, 0).a;
			#else
				return texelFetch(tDepth, uv.xy, 0).r;
			#endif
		}

		vec3 computeNormalFromDepth(const vec2 uv) {
			vec2 size = vec2(textureSize(tDepth, 0));
			ivec2 p = ivec2(uv * size);
			float c0 = fetchDepth(p);
			float l2 = fetchDepth(p - ivec2(2, 0));
			float l1 = fetchDepth(p - ivec2(1, 0));
			float r1 = fetchDepth(p + ivec2(1, 0));
			float r2 = fetchDepth(p + ivec2(2, 0));
			float b2 = fetchDepth(p - ivec2(0, 2));
			float b1 = fetchDepth(p - ivec2(0, 1));
			float t1 = fetchDepth(p + ivec2(0, 1));
			float t2 = fetchDepth(p + ivec2(0, 2));
			float dl = abs((2.0 * l1 - l2) - c0);
			float dr = abs((2.0 * r1 - r2) - c0);
			float db = abs((2.0 * b1 - b2) - c0);
			float dt = abs((2.0 * t1 - t2) - c0);
			vec3 ce = getViewPosition(uv, c0).xyz;
			vec3 dpdx = (dl < dr) ?  ce - getViewPosition((uv - vec2(1.0 / size.x, 0.0)), l1).xyz
									: -ce + getViewPosition((uv + vec2(1.0 / size.x, 0.0)), r1).xyz;
			vec3 dpdy = (db < dt) ?  ce - getViewPosition((uv - vec2(0.0, 1.0 / size.y)), b1).xyz
									: -ce + getViewPosition((uv + vec2(0.0, 1.0 / size.y)), t1).xyz;
			return normalize(cross(dpdx, dpdy));
		}

		vec3 getViewNormal(const vec2 uv) {
		#if NORMAL_VECTOR_TYPE == 2
			return normalize(textureLod(tNormal, uv, 0.).rgb);
		#elif NORMAL_VECTOR_TYPE == 1
			return unpackRGBToNormal(textureLod(tNormal, uv, 0.).rgb);
		#else
			return computeNormalFromDepth(uv);
		#endif
		}

		void denoiseSample(in vec3 center, in vec3 viewNormal, in vec3 viewPos, in vec2 sampleUv, inout vec3 denoised, inout float totalWeight) {
			vec4 sampleTexel = textureLod(tDiffuse, sampleUv, 0.0);
			float sampleDepth = getDepth(sampleUv);
			vec3 sampleNormal = getViewNormal(sampleUv);
			vec3 neighborColor = sampleTexel.rgb;
			vec3 viewPosSample = getViewPosition(sampleUv, sampleDepth);
			
			float normalDiff = dot(viewNormal, sampleNormal);
			float normalSimilarity = pow(max(normalDiff, 0.), normalPhi);
			float lumaDiff = abs(getLuminance(neighborColor) - getLuminance(center));
			float lumaSimilarity = max(1.0 - lumaDiff / lumaPhi, 0.0);
			float depthDiff = abs(dot(viewPos - viewPosSample, viewNormal));
			float depthSimilarity = max(1. - depthDiff / depthPhi, 0.);
			float w = lumaSimilarity * depthSimilarity * normalSimilarity;
		
			denoised += w * neighborColor;
			totalWeight += w;
		}
		
		void main() {
			float depth = getDepth(vUv.xy);	
			vec3 viewNormal = getViewNormal(vUv);	
			if (depth == 1. || dot(viewNormal, viewNormal) == 0.) {
				discard;
				return;
			}
			vec4 texel = textureLod(tDiffuse, vUv, 0.0);
			vec3 center = texel.rgb;
			vec3 viewPos = getViewPosition(vUv, depth);

			vec2 noiseResolution = vec2(textureSize(tNoise, 0));
			vec2 noiseUv = vUv * resolution / noiseResolution;
			vec4 noiseTexel = textureLod(tNoise, noiseUv, 0.0);
      		vec2 noiseVec = vec2(sin(noiseTexel[index % 4] * 2. * PI), cos(noiseTexel[index % 4] * 2. * PI));
    		mat2 rotationMatrix = mat2(noiseVec.x, -noiseVec.y, noiseVec.x, noiseVec.y);
		
			float totalWeight = 1.0;
			vec3 denoised = texel.rgb;
			for (int i = 0; i < SAMPLES; i++) {
				vec3 sampleDir = poissonDisk[i];
				vec2 offset = rotationMatrix * (sampleDir.xy * (1. + sampleDir.z * (radius - 1.)) / resolution);
				vec2 sampleUv = vUv + offset;
				denoiseSample(center, viewNormal, viewPos, sampleUv, denoised, totalWeight);
			}
		
			if (totalWeight > 0.) { 
				denoised /= totalWeight;
			}
			gl_FragColor = FRAGMENT_OUTPUT;
		}`};function mt(m,e,s){const t=Xt(m,e,s);let o="vec3[SAMPLES](";for(let a=0;a<m;a++){const r=t[a];o+=`vec3(${r.x}, ${r.y}, ${r.z})${a<m-1?",":")"}`}return o}function Xt(m,e,s){const t=[];for(let o=0;o<m;o++){const a=2*Math.PI*e*o/m,r=Math.pow(o/(m-1),s);t.push(new A(Math.cos(a),Math.sin(a),r))}return t}class Qt{constructor(e=Math){this.grad3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]],this.grad4=[[0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],[0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],[1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],[-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],[1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],[-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],[1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],[-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0]],this.p=[];for(let s=0;s<256;s++)this.p[s]=Math.floor(e.random()*256);this.perm=[];for(let s=0;s<512;s++)this.perm[s]=this.p[s&255];this.simplex=[[0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],[0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],[1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],[2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]}dot(e,s,t){return e[0]*s+e[1]*t}dot3(e,s,t,o){return e[0]*s+e[1]*t+e[2]*o}dot4(e,s,t,o,a){return e[0]*s+e[1]*t+e[2]*o+e[3]*a}noise(e,s){let t,o,a;const r=.5*(Math.sqrt(3)-1),n=(e+s)*r,h=Math.floor(e+n),u=Math.floor(s+n),l=(3-Math.sqrt(3))/6,d=(h+u)*l,p=h-d,f=u-d,v=e-p,S=s-f;let O,I;v>S?(O=1,I=0):(O=0,I=1);const E=v-O+l,y=S-I+l,R=v-1+2*l,w=S-1+2*l,N=h&255,x=u&255,L=this.perm[N+this.perm[x]]%12,C=this.perm[N+O+this.perm[x+I]]%12,T=this.perm[N+1+this.perm[x+1]]%12;let b=.5-v*v-S*S;b<0?t=0:(b*=b,t=b*b*this.dot(this.grad3[L],v,S));let P=.5-E*E-y*y;P<0?o=0:(P*=P,o=P*P*this.dot(this.grad3[C],E,y));let j=.5-R*R-w*w;return j<0?a=0:(j*=j,a=j*j*this.dot(this.grad3[T],R,w)),70*(t+o+a)}noise3d(e,s,t){let o,a,r,n;const u=(e+s+t)*.3333333333333333,l=Math.floor(e+u),d=Math.floor(s+u),p=Math.floor(t+u),f=1/6,v=(l+d+p)*f,S=l-v,O=d-v,I=p-v,E=e-S,y=s-O,R=t-I;let w,N,x,L,C,T;E>=y?y>=R?(w=1,N=0,x=0,L=1,C=1,T=0):E>=R?(w=1,N=0,x=0,L=1,C=0,T=1):(w=0,N=0,x=1,L=1,C=0,T=1):y<R?(w=0,N=0,x=1,L=0,C=1,T=1):E<R?(w=0,N=1,x=0,L=0,C=1,T=1):(w=0,N=1,x=0,L=1,C=1,T=0);const b=E-w+f,P=y-N+f,j=R-x+f,se=E-L+2*f,B=y-C+2*f,Q=R-T+2*f,ae=E-1+3*f,K=y-1+3*f,_=R-1+3*f,Z=l&255,q=d&255,W=p&255,me=this.perm[Z+this.perm[q+this.perm[W]]]%12,pe=this.perm[Z+w+this.perm[q+N+this.perm[W+x]]]%12,ge=this.perm[Z+L+this.perm[q+C+this.perm[W+T]]]%12,ve=this.perm[Z+1+this.perm[q+1+this.perm[W+1]]]%12;let X=.6-E*E-y*y-R*R;X<0?o=0:(X*=X,o=X*X*this.dot3(this.grad3[me],E,y,R));let k=.6-b*b-P*P-j*j;k<0?a=0:(k*=k,a=k*k*this.dot3(this.grad3[pe],b,P,j));let H=.6-se*se-B*B-Q*Q;H<0?r=0:(H*=H,r=H*H*this.dot3(this.grad3[ge],se,B,Q));let G=.6-ae*ae-K*K-_*_;return G<0?n=0:(G*=G,n=G*G*this.dot3(this.grad3[ve],ae,K,_)),32*(o+a+r+n)}noise4d(e,s,t,o){const a=this.grad4,r=this.simplex,n=this.perm,h=(Math.sqrt(5)-1)/4,u=(5-Math.sqrt(5))/20;let l,d,p,f,v;const S=(e+s+t+o)*h,O=Math.floor(e+S),I=Math.floor(s+S),E=Math.floor(t+S),y=Math.floor(o+S),R=(O+I+E+y)*u,w=O-R,N=I-R,x=E-R,L=y-R,C=e-w,T=s-N,b=t-x,P=o-L,j=C>T?32:0,se=C>b?16:0,B=T>b?8:0,Q=C>P?4:0,ae=T>P?2:0,K=b>P?1:0,_=j+se+B+Q+ae+K,Z=r[_][0]>=3?1:0,q=r[_][1]>=3?1:0,W=r[_][2]>=3?1:0,me=r[_][3]>=3?1:0,pe=r[_][0]>=2?1:0,ge=r[_][1]>=2?1:0,ve=r[_][2]>=2?1:0,X=r[_][3]>=2?1:0,k=r[_][0]>=1?1:0,H=r[_][1]>=1?1:0,G=r[_][2]>=1?1:0,Ve=r[_][3]>=1?1:0,Re=C-Z+u,xe=T-q+u,Me=b-W+u,Te=P-me+u,Ae=C-pe+2*u,_e=T-ge+2*u,be=b-ve+2*u,le=P-X+2*u,$=C-k+3*u,Ne=T-H+3*u,Ue=b-G+3*u,Se=P-Ve+3*u,ce=C-1+4*u,Oe=T-1+4*u,Ie=b-1+4*u,ye=P-1+4*u,ue=O&255,he=I&255,oe=E&255,V=y&255,i=n[ue+n[he+n[oe+n[V]]]]%32,c=n[ue+Z+n[he+q+n[oe+W+n[V+me]]]]%32,g=n[ue+pe+n[he+ge+n[oe+ve+n[V+X]]]]%32,M=n[ue+k+n[he+H+n[oe+G+n[V+Ve]]]]%32,z=n[ue+1+n[he+1+n[oe+1+n[V+1]]]]%32;let F=.6-C*C-T*T-b*b-P*P;F<0?l=0:(F*=F,l=F*F*this.dot4(a[i],C,T,b,P));let U=.6-Re*Re-xe*xe-Me*Me-Te*Te;U<0?d=0:(U*=U,d=U*U*this.dot4(a[c],Re,xe,Me,Te));let Pe=.6-Ae*Ae-_e*_e-be*be-le*le;Pe<0?p=0:(Pe*=Pe,p=Pe*Pe*this.dot4(a[g],Ae,_e,be,le));let fe=.6-$*$-Ne*Ne-Ue*Ue-Se*Se;fe<0?f=0:(fe*=fe,f=fe*fe*this.dot4(a[M],$,Ne,Ue,Se));let re=.6-ce*ce-Oe*Oe-Ie*Ie-ye*ye;return re<0?v=0:(re*=re,v=re*re*this.dot4(a[z],ce,Oe,Ie,ye)),27*(l+d+p+f+v)}}class ne extends de{constructor(e,s,t,o,a,r,n){super(),this.width=t!==void 0?t:512,this.height=o!==void 0?o:512,this.clear=!0,this.camera=s,this.scene=e,this.output=0,this._renderGBuffer=!0,this._visibilityCache=new Map,this.blendIntensity=1,this.pdRings=2,this.pdRadiusExponent=2,this.pdSamples=16,this.gtaoNoiseTexture=Zt(),this.pdNoiseTexture=this.generateNoise(),this.gtaoRenderTarget=new Ce(this.width,this.height,{type:De}),this.pdRenderTarget=this.gtaoRenderTarget.clone(),this.gtaoMaterial=new Y({defines:Object.assign({},Ze.defines),uniforms:ie.clone(Ze.uniforms),vertexShader:Ze.vertexShader,fragmentShader:Ze.fragmentShader,blending:te,depthTest:!1,depthWrite:!1}),this.gtaoMaterial.definesPERSPECTIVE_CAMERA=this.camera.isPerspectiveCamera?1:0,this.gtaoMaterial.uniforms.tNoise.value=this.gtaoNoiseTexture,this.gtaoMaterial.uniforms.resolution.value.set(this.width,this.height),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.normalMaterial=new yt,this.normalMaterial.blending=te,this.pdMaterial=new Y({defines:Object.assign({},Xe.defines),uniforms:ie.clone(Xe.uniforms),vertexShader:Xe.vertexShader,fragmentShader:Xe.fragmentShader,depthTest:!1,depthWrite:!1}),this.pdMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.pdMaterial.uniforms.tNoise.value=this.pdNoiseTexture,this.pdMaterial.uniforms.resolution.value.set(this.width,this.height),this.pdMaterial.uniforms.lumaPhi.value=10,this.pdMaterial.uniforms.depthPhi.value=2,this.pdMaterial.uniforms.normalPhi.value=3,this.pdMaterial.uniforms.radius.value=8,this.depthRenderMaterial=new Y({defines:Object.assign({},We.defines),uniforms:ie.clone(We.uniforms),vertexShader:We.vertexShader,fragmentShader:We.fragmentShader,blending:te}),this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.copyMaterial=new Y({uniforms:ie.clone(je.uniforms),vertexShader:je.vertexShader,fragmentShader:je.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blendSrc:ot,blendDst:Ge,blendEquation:He,blendSrcAlpha:at,blendDstAlpha:Ge,blendEquationAlpha:He}),this.blendMaterial=new Y({uniforms:ie.clone(et.uniforms),vertexShader:et.vertexShader,fragmentShader:et.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blending:Pt,blendSrc:ot,blendDst:Ge,blendEquation:He,blendSrcAlpha:at,blendDstAlpha:Ge,blendEquationAlpha:He}),this.fsQuad=new qe(null),this.originalClearColor=new Fe,this.setGBuffer(a?a.depthTexture:void 0,a?a.normalTexture:void 0),r!==void 0&&this.updateGtaoMaterial(r),n!==void 0&&this.updatePdMaterial(n)}dispose(){this.gtaoNoiseTexture.dispose(),this.pdNoiseTexture.dispose(),this.normalRenderTarget.dispose(),this.gtaoRenderTarget.dispose(),this.pdRenderTarget.dispose(),this.normalMaterial.dispose(),this.pdMaterial.dispose(),this.copyMaterial.dispose(),this.depthRenderMaterial.dispose(),this.fsQuad.dispose()}setGBuffer(e,s){e!==void 0?(this.depthTexture=e,this.normalTexture=s,this._renderGBuffer=!1):(this.depthTexture=new Et,this.depthTexture.format=wt,this.depthTexture.type=Ct,this.normalRenderTarget=new Ce(this.width,this.height,{minFilter:rt,magFilter:rt,type:De,depthTexture:this.depthTexture}),this.normalTexture=this.normalRenderTarget.texture,this._renderGBuffer=!0);const t=this.normalTexture?1:0,o=this.depthTexture===this.normalTexture?"w":"x";this.gtaoMaterial.defines.NORMAL_VECTOR_TYPE=t,this.gtaoMaterial.defines.DEPTH_SWIZZLING=o,this.gtaoMaterial.uniforms.tNormal.value=this.normalTexture,this.gtaoMaterial.uniforms.tDepth.value=this.depthTexture,this.pdMaterial.defines.NORMAL_VECTOR_TYPE=t,this.pdMaterial.defines.DEPTH_SWIZZLING=o,this.pdMaterial.uniforms.tNormal.value=this.normalTexture,this.pdMaterial.uniforms.tDepth.value=this.depthTexture,this.depthRenderMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture}setSceneClipBox(e){e?(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX!==1,this.gtaoMaterial.defines.SCENE_CLIP_BOX=1,this.gtaoMaterial.uniforms.sceneBoxMin.value.copy(e.min),this.gtaoMaterial.uniforms.sceneBoxMax.value.copy(e.max)):(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX===0,this.gtaoMaterial.defines.SCENE_CLIP_BOX=0)}updateGtaoMaterial(e){e.radius!==void 0&&(this.gtaoMaterial.uniforms.radius.value=e.radius),e.distanceExponent!==void 0&&(this.gtaoMaterial.uniforms.distanceExponent.value=e.distanceExponent),e.thickness!==void 0&&(this.gtaoMaterial.uniforms.thickness.value=e.thickness),e.distanceFallOff!==void 0&&(this.gtaoMaterial.uniforms.distanceFallOff.value=e.distanceFallOff,this.gtaoMaterial.needsUpdate=!0),e.scale!==void 0&&(this.gtaoMaterial.uniforms.scale.value=e.scale),e.samples!==void 0&&e.samples!==this.gtaoMaterial.defines.SAMPLES&&(this.gtaoMaterial.defines.SAMPLES=e.samples,this.gtaoMaterial.needsUpdate=!0),e.screenSpaceRadius!==void 0&&(e.screenSpaceRadius?1:0)!==this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS&&(this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS=e.screenSpaceRadius?1:0,this.gtaoMaterial.needsUpdate=!0)}updatePdMaterial(e){let s=!1;e.lumaPhi!==void 0&&(this.pdMaterial.uniforms.lumaPhi.value=e.lumaPhi),e.depthPhi!==void 0&&(this.pdMaterial.uniforms.depthPhi.value=e.depthPhi),e.normalPhi!==void 0&&(this.pdMaterial.uniforms.normalPhi.value=e.normalPhi),e.radius!==void 0&&e.radius!==this.radius&&(this.pdMaterial.uniforms.radius.value=e.radius),e.radiusExponent!==void 0&&e.radiusExponent!==this.pdRadiusExponent&&(this.pdRadiusExponent=e.radiusExponent,s=!0),e.rings!==void 0&&e.rings!==this.pdRings&&(this.pdRings=e.rings,s=!0),e.samples!==void 0&&e.samples!==this.pdSamples&&(this.pdSamples=e.samples,s=!0),s&&(this.pdMaterial.defines.SAMPLES=this.pdSamples,this.pdMaterial.defines.SAMPLE_VECTORS=mt(this.pdSamples,this.pdRings,this.pdRadiusExponent),this.pdMaterial.needsUpdate=!0)}render(e,s,t){switch(this._renderGBuffer&&(this.overrideVisibility(),this.renderOverride(e,this.normalMaterial,this.normalRenderTarget,7829503,1),this.restoreVisibility()),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.gtaoMaterial.uniforms.cameraWorldMatrix.value.copy(this.camera.matrixWorld),this.renderPass(e,this.gtaoMaterial,this.gtaoRenderTarget,16777215,1),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.renderPass(e,this.pdMaterial,this.pdRenderTarget,16777215,1),this.output){case ne.OUTPUT.Diffuse:this.copyMaterial.uniforms.tDiffuse.value=t.texture,this.copyMaterial.blending=te,this.renderPass(e,this.copyMaterial,this.renderToScreen?null:s);break;case ne.OUTPUT.AO:this.copyMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.copyMaterial.blending=te,this.renderPass(e,this.copyMaterial,this.renderToScreen?null:s);break;case ne.OUTPUT.Denoise:this.copyMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this.copyMaterial.blending=te,this.renderPass(e,this.copyMaterial,this.renderToScreen?null:s);break;case ne.OUTPUT.Depth:this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.renderPass(e,this.depthRenderMaterial,this.renderToScreen?null:s);break;case ne.OUTPUT.Normal:this.copyMaterial.uniforms.tDiffuse.value=this.normalRenderTarget.texture,this.copyMaterial.blending=te,this.renderPass(e,this.copyMaterial,this.renderToScreen?null:s);break;case ne.OUTPUT.Default:this.copyMaterial.uniforms.tDiffuse.value=t.texture,this.copyMaterial.blending=te,this.renderPass(e,this.copyMaterial,this.renderToScreen?null:s),this.blendMaterial.uniforms.intensity.value=this.blendIntensity,this.blendMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this.renderPass(e,this.blendMaterial,this.renderToScreen?null:s);break;default:console.warn("THREE.GTAOPass: Unknown output type.")}}renderPass(e,s,t,o,a){e.getClearColor(this.originalClearColor);const r=e.getClearAlpha(),n=e.autoClear;e.setRenderTarget(t),e.autoClear=!1,o!=null&&(e.setClearColor(o),e.setClearAlpha(a||0),e.clear()),this.fsQuad.material=s,this.fsQuad.render(e),e.autoClear=n,e.setClearColor(this.originalClearColor),e.setClearAlpha(r)}renderOverride(e,s,t,o,a){e.getClearColor(this.originalClearColor);const r=e.getClearAlpha(),n=e.autoClear;e.setRenderTarget(t),e.autoClear=!1,o=s.clearColor||o,a=s.clearAlpha||a,o!=null&&(e.setClearColor(o),e.setClearAlpha(a||0),e.clear()),this.scene.overrideMaterial=s,e.render(this.scene,this.camera),this.scene.overrideMaterial=null,e.autoClear=n,e.setClearColor(this.originalClearColor),e.setClearAlpha(r)}setSize(e,s){this.width=e,this.height=s,this.gtaoRenderTarget.setSize(e,s),this.normalRenderTarget.setSize(e,s),this.pdRenderTarget.setSize(e,s),this.gtaoMaterial.uniforms.resolution.value.set(e,s),this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.pdMaterial.uniforms.resolution.value.set(e,s),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse)}overrideVisibility(){const e=this.scene,s=this._visibilityCache;e.traverse(function(t){s.set(t,t.visible),(t.isPoints||t.isLine)&&(t.visible=!1)})}restoreVisibility(){const e=this.scene,s=this._visibilityCache;e.traverse(function(t){const o=s.get(t);t.visible=o}),s.clear()}generateNoise(e=64){const s=new Qt,t=e*e*4,o=new Uint8Array(t);for(let r=0;r<e;r++)for(let n=0;n<e;n++){const h=r,u=n;o[(r*e+n)*4]=(s.noise(h,u)*.5+.5)*255,o[(r*e+n)*4+1]=(s.noise(h+e,u)*.5+.5)*255,o[(r*e+n)*4+2]=(s.noise(h,u+e)*.5+.5)*255,o[(r*e+n)*4+3]=(s.noise(h+e,u+e)*.5+.5)*255}const a=new dt(o,e,e,Dt,Rt);return a.wrapS=Ke,a.wrapT=Ke,a.needsUpdate=!0,a}}ne.OUTPUT={Default:0,Diffuse:1,Depth:2,Normal:3,AO:4,Denoise:5};const Kt={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`
	
		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = OptimizedCineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};class si extends de{constructor(){super();const e=Kt;this.uniforms=ie.clone(e.uniforms),this.material=new At({name:e.name,uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader}),this.fsQuad=new qe(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,s,t){this.uniforms.tDiffuse.value=t.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},_t.getTransfer(this._outputColorSpace)===Nt&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===Ut?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===Ot?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===It?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===Lt?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===zt&&(this.material.defines.AGX_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(s),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this.fsQuad.render(e))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}const qt={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new Fe(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			vec3 luma = vec3( 0.299, 0.587, 0.114 );

			float v = dot( texel.xyz, luma );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};class Be extends de{constructor(e,s,t,o){super(),this.strength=s!==void 0?s:1,this.radius=t,this.threshold=o,this.resolution=e!==void 0?new D(e.x,e.y):new D(256,256),this.clearColor=new Fe(0,0,0),this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let a=Math.round(this.resolution.x/2),r=Math.round(this.resolution.y/2);this.renderTargetBright=new Ce(a,r,{type:De}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let d=0;d<this.nMips;d++){const p=new Ce(a,r,{type:De});p.texture.name="UnrealBloomPass.h"+d,p.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(p);const f=new Ce(a,r,{type:De});f.texture.name="UnrealBloomPass.v"+d,f.texture.generateMipmaps=!1,this.renderTargetsVertical.push(f),a=Math.round(a/2),r=Math.round(r/2)}const n=qt;this.highPassUniforms=ie.clone(n.uniforms),this.highPassUniforms.luminosityThreshold.value=o,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new Y({uniforms:this.highPassUniforms,vertexShader:n.vertexShader,fragmentShader:n.fragmentShader}),this.separableBlurMaterials=[];const h=[3,5,7,9,11];a=Math.round(this.resolution.x/2),r=Math.round(this.resolution.y/2);for(let d=0;d<this.nMips;d++)this.separableBlurMaterials.push(this.getSeperableBlurMaterial(h[d])),this.separableBlurMaterials[d].uniforms.invSize.value=new D(1/a,1/r),a=Math.round(a/2),r=Math.round(r/2);this.compositeMaterial=this.getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=s,this.compositeMaterial.uniforms.bloomRadius.value=.1;const u=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=u,this.bloomTintColors=[new A(1,1,1),new A(1,1,1),new A(1,1,1),new A(1,1,1),new A(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors;const l=je;this.copyUniforms=ie.clone(l.uniforms),this.blendMaterial=new Y({uniforms:this.copyUniforms,vertexShader:l.vertexShader,fragmentShader:l.fragmentShader,blending:jt,depthTest:!1,depthWrite:!1,transparent:!0}),this.enabled=!0,this.needsSwap=!1,this._oldClearColor=new Fe,this.oldClearAlpha=1,this.basic=new Ft,this.fsQuad=new qe(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this.basic.dispose(),this.fsQuad.dispose()}setSize(e,s){let t=Math.round(e/2),o=Math.round(s/2);this.renderTargetBright.setSize(t,o);for(let a=0;a<this.nMips;a++)this.renderTargetsHorizontal[a].setSize(t,o),this.renderTargetsVertical[a].setSize(t,o),this.separableBlurMaterials[a].uniforms.invSize.value=new D(1/t,1/o),t=Math.round(t/2),o=Math.round(o/2)}render(e,s,t,o,a){e.getClearColor(this._oldClearColor),this.oldClearAlpha=e.getClearAlpha();const r=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),a&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this.fsQuad.material=this.basic,this.basic.map=t.texture,e.setRenderTarget(null),e.clear(),this.fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=t.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this.fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this.fsQuad.render(e);let n=this.renderTargetBright;for(let h=0;h<this.nMips;h++)this.fsQuad.material=this.separableBlurMaterials[h],this.separableBlurMaterials[h].uniforms.colorTexture.value=n.texture,this.separableBlurMaterials[h].uniforms.direction.value=Be.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[h]),e.clear(),this.fsQuad.render(e),this.separableBlurMaterials[h].uniforms.colorTexture.value=this.renderTargetsHorizontal[h].texture,this.separableBlurMaterials[h].uniforms.direction.value=Be.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[h]),e.clear(),this.fsQuad.render(e),n=this.renderTargetsVertical[h];this.fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this.fsQuad.render(e),this.fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,a&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(t),this.fsQuad.render(e)),e.setClearColor(this._oldClearColor,this.oldClearAlpha),e.autoClear=r}getSeperableBlurMaterial(e){const s=[];for(let t=0;t<e;t++)s.push(.39894*Math.exp(-.5*t*t/(e*e))/e);return new Y({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new D(.5,.5)},direction:{value:new D(.5,.5)},gaussianCoefficients:{value:s}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {
					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;
					for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
						float x = float(i);
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += (sample1 + sample2) * w;
						weightSum += 2.0 * w;
					}
					gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
				}`})}getCompositeMaterial(e){return new Y({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`varying vec2 vUv;
				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor(const in float factor) {
					float mirrorFactor = 1.2 - factor;
					return mix(factor, mirrorFactor, bloomRadius);
				}

				void main() {
					gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
						lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
						lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
						lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
						lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
				}`})}}Be.BlurDirectionX=new D(1,0);Be.BlurDirectionY=new D(0,1);export{ti as E,ne as G,si as O,ii as R,Gt as S,Be as U,Jt as a,ei as m};
