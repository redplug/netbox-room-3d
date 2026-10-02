import * as THREE from 'three';
import { dimensions, deviceBottom, U } from './geometry.js';
export function createCapacityOverlays(scene) {
  let group,key;
  const clear=()=>{if(!group)return;group.traverse(o=>{o.geometry?.dispose();o.material?.dispose();o.element?.remove();});group.removeFromParent();group=null;};
  return {update(layout,racks,analysis,show) {
    const next=JSON.stringify([layout.placements,racks.map(r=>[r.id,r.width,r.depth,r.height,r.u_height,r.starting_unit,r.desc_units]),analysis,show]);
    if(next===key)return;key=next;clear();if(!analysis||!show)return;
    group=new THREE.Group();scene.scene.add(group);
    for(const p of layout.placements) {
      const rack=racks.find(r=>r.id===p.rack_id),info=analysis.racks.find(r=>r.id===p.rack_id);if(!rack||!info)continue;
      const dims=dimensions(rack,p),rw=dims.width/1000,rd=dims.depth/1000,rh=dims.height/1000;
      const root=new THREE.Group();root.position.set(p.x/1000,0,p.z/1000);root.rotation.y=-(p.rotation||0)*Math.PI/180;group.add(root);
      if(info.complete) {
        const percent=info.after.occupancy_percent,color=percent>=90?'#d95547':percent>=70?'#dda323':'#168a87';
        const floor=new THREE.Mesh(new THREE.PlaneGeometry(rw,rd),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.25,depthWrite:false,side:THREE.DoubleSide}));floor.rotation.x=-Math.PI/2;floor.position.y=.026;root.add(floor);
      }
      const box=(record,color,opacity)=>{
        const bottom=deviceBottom(rack,record);if(bottom==null)return;
        const height=record.u_height*U/1000,depth=record.full_depth?rd-.08:rd*.42;
        const mesh=new THREE.Mesh(new THREE.BoxGeometry(Math.min((rack.rail_width||482.6)/1000,rw-.08),Math.max(.008,height-.003),depth),new THREE.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false,depthTest:false}));
        mesh.position.set(0,(rh-rack.u_height*U/1000)/2+bottom/1000+height/2,record.full_depth?0:(record.face==='rear'?-1:1)*(rd/2-depth/2-.03));mesh.renderOrder=35;root.add(mesh);
        const shape=new THREE.EdgesGeometry(mesh.geometry),line=new THREE.LineSegments(shape,new THREE.LineBasicMaterial({color,depthTest:false}));line.position.copy(mesh.position);line.renderOrder=36;root.add(line);
      };
      for(const booking of info.reservations)for(const unit of booking.units)box({position:unit,u_height:1,face:'front',full_depth:true},'#d69b24',.12);
      const planned=analysis.planned_devices.filter(d=>d.rack_id===rack.id);
      for(const device of planned)if(device.u_height)box(device,device.valid?'#008fcb':'#d95547',.42);
      if(planned.length)scene.label(`가상 ${planned.length}대`,rw*.85,rh+.1,0,root,'planned-device');
    }
    scene.draw();
  },dispose:clear};
}
