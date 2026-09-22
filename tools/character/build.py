"""Author, skin and export the Mostaza character in Blender 4.3.
source-mesh.json is the editable starting sculpture. Blender joins and relaxes
facial and shirt surfaces, applies smooth skin weights and bakes animation clips.
"""
import bpy,bmesh,json,os,math,sys
import numpy as np
from mathutils import Vector,Quaternion
from math import sin,cos,pi
ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),'../..'))
OUT=ROOT+'/public/game/assets/models'
source=json.load(open(os.path.dirname(__file__)+'/source-mesh.json'))
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def v(p):return Vector((p[0],-p[2],p[1]))
mats={};objs=[];roles={}
for i,m in enumerate(source['meshes']):
 key='logo' if m['logo'] else m['hex']
 if key not in mats:
  mat=bpy.data.materials.new(key);mat.use_nodes=True;bs=mat.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*m['color'],1);bs.inputs['Roughness'].default_value=m['roughness'];mats[key]=mat
  if key=='logo':
   im=bpy.data.images.load(ROOT+'/public/game/assets/mostaza.png');im.pack();tx=mat.node_tree.nodes.new('ShaderNodeTexImage');tx.image=im;mat.node_tree.links.new(tx.outputs['Color'],bs.inputs['Base Color']);mat.node_tree.links.new(tx.outputs['Alpha'],bs.inputs['Alpha']);mat.surface_render_method='DITHERED'
 me=bpy.data.meshes.new('Surface');faces=[m['indices'][j:j+3] for j in range(0,len(m['indices']),3)];me.from_pydata([v(p) for p in m['verts']],[],faces);me.update()
 if m['uv']:
  uv=me.uv_layers.new()
  for poly in me.polygons:
   for li in poly.loop_indices:
    vi=me.loops[li].vertex_index;uv.data[li].uv=m['uv'][vi*2:vi*2+2]
 ob=bpy.data.objects.new(f"{m['bone']}_{key}_{i}",me);bpy.context.collection.objects.link(ob);me.materials.append(mats[key]);objs.append(ob);roles[ob.name]=m['bone']
 for poly in me.polygons:poly.use_smooth=True

sys.path.insert(0,os.path.dirname(__file__))
from refine import refine
refine(bpy,math,objs,roles,mats)

def sculpt(group,name,role,voxel):
 bpy.ops.object.select_all(action='DESELECT')
 for ob in group:ob.select_set(True);objs.remove(ob);roles.pop(ob.name,None)
 bpy.context.view_layer.objects.active=group[0];bpy.ops.object.join();ob=bpy.context.object;ob.name=name
 # Close the source lofts before voxel union; otherwise open cloth shells vanish.
 bm=bmesh.new();bm.from_mesh(ob.data);bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.00001)
 boundary=[e for e in bm.edges if e.is_boundary]
 if boundary:bmesh.ops.holes_fill(bm,edges=boundary,sides=0)
 bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(ob.data);bm.free();ob.data.validate()
 mod=ob.modifiers.new('Continuous sculpted volume','REMESH');mod.mode='VOXEL';mod.voxel_size=voxel;mod.use_smooth_shade=True;bpy.ops.object.modifier_apply(modifier=mod.name)
 mod=ob.modifiers.new('Relax sculpted surface','SMOOTH');mod.factor=.65;mod.iterations=5;bpy.ops.object.modifier_apply(modifier=mod.name)
 mod=ob.modifiers.new('Mobile topology','DECIMATE');mod.ratio=.34;bpy.ops.object.modifier_apply(modifier=mod.name)
 for poly in ob.data.polygons:poly.use_smooth=True
 objs.append(ob);roles[ob.name]=role;ob.select_set(False)
# Fuse all skin-colored face features into one head with continuous cheeks/nose/ears.
sculpt([o for o in objs if roles[o.name]=='head' and o.data.materials[0].name=='c98f68'],'Sculpted_head','head',.004)
# Only the large torso and sleeve shells participate; tiny stitches stay separate.
shirt=[o for o in objs if roles[o.name] in ['spine','upper_L','upper_R'] and o.data.materials[0].name=='cf2037' and len(o.data.vertices)>70]
sculpt(shirt,'Tailored_shirt','shirt',.011)
# Smooth connected skin surfaces at elbows; keep fingers and hair detail separate.
for side in ['L','R']:
 group=[o for o in objs if roles[o.name]=='fore_'+side and o.data.materials[0].name=='c98f68']
 sculpt(group,'Forearm_'+side,'fore_'+side,.009)
j=source['joints'];bones=[('hips',j['hips'],[0,1.08,0],None),('spine',j['spine'],[0,1.55,0],'hips'),('head',j['head'],[0,1.92,0],'spine'),('pack',j['pack'],[0,1.44,.27],'spine')]
for side in ['L','R']:
 bones.extend([('upper_'+side,j['upper_'+side],j['fore_'+side],'spine'),('fore_'+side,j['fore_'+side],j['hand_'+side],'upper_'+side),('hand_'+side,j['hand_'+side],[j['hand_'+side][0],j['hand_'+side][1]-.07,0],'fore_'+side),('thigh_'+side,j['thigh_'+side],j['shin_'+side],'hips'),('shin_'+side,j['shin_'+side],j['foot_'+side],'thigh_'+side),('foot_'+side,j['foot_'+side],[j['foot_'+side][0],.09,-.18],'shin_'+side)])
adata=bpy.data.armatures.new('Anatomical skeleton');arm=bpy.data.objects.new('Mostaza_Rig',adata);bpy.context.collection.objects.link(arm);bpy.context.view_layer.objects.active=arm;arm.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
for name,head,tail,parent in bones:
 b=adata.edit_bones.new(name);b.head=v(head);b.tail=v(tail)
 if parent:b.parent=adata.edit_bones[parent]
bpy.ops.object.mode_set(mode='OBJECT');arm.select_set(False)
def clamp(x):return max(0,min(1,x))
for ob in objs:
 for name,_,_,_ in bones:ob.vertex_groups.new(name=name)
 role=roles[ob.name]
 for ve in ob.data.vertices:
  x,y,z=ve.co.x,ve.co.z,-ve.co.y;weights={role:1}
  if role=='shirt':
   side='L' if x<0 else 'R';w=clamp((abs(x)-.20)/.12)*clamp((1.5-y)/.19);weights={'spine':1-w,'upper_'+side:w}
  elif role.startswith('shin_'):
   side=role[-1]
   if y<.20:weights={'foot_'+side:1}
   else:
    w=clamp((.62-y)/.12);weights={'thigh_'+side:1-w,'shin_'+side:w}
  elif role.startswith('thigh_'):
   side=role[-1];w=clamp((.94-y)/.16);weights={'hips':1-w,'thigh_'+side:w}
  elif role.startswith('fore_'):
   side=role[-1];w=clamp((j['fore_'+side][1]+.035-y)/.08);weights={'upper_'+side:1-w,'fore_'+side:w}
  for name,w in weights.items():
   if w>0:ob.vertex_groups[name].add([ve.index],w,'REPLACE')
 mod=ob.modifiers.new('Smooth skin deformation','ARMATURE');mod.object=arm;ob.parent=arm
# Proportion correction: longer lower body and a shorter, tailored torso.
# Apply the same rest-space mapping to meshes and skeleton after skinning.
def body_shape(co):
 z=co.z
 co.z=z*1.10 if z<.92 else 1.012+(z-.92)*.88 if z<1.57 else z+.014
 co.x*=.87
for ob in objs:
 for ve in ob.data.vertices:body_shape(ve.co)
bpy.context.view_layer.objects.active=arm;arm.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
for bone in adata.edit_bones:
 h=bone.head.copy();t=bone.tail.copy();body_shape(h);body_shape(t);bone.head=h;bone.tail=t
bpy.ops.object.mode_set(mode='OBJECT');arm.select_set(False)
# Merge surfaces by material to minimize runtime draw calls.
groups={}
for ob in objs:groups.setdefault(ob.data.materials[0].name,[]).append(ob)
for name,group in groups.items():
 bpy.ops.object.select_all(action='DESELECT')
 for ob in group:ob.select_set(True)
 bpy.context.view_layer.objects.active=group[0];bpy.ops.object.join();group[0].name='Character_'+name;group[0].data.validate()
# Small real fabric textures, packed into the GLB; no procedural shader cost on mobile.
for ob in [o for o in bpy.context.scene.objects if o.type=='MESH']:
 mat=ob.data.materials[0];key=mat.name;bs=mat.node_tree.nodes.get('Principled BSDF')
 if key in ['cf2037','242936','dfad48','efdfbd']:
  base=np.array(bs.inputs['Base Color'].default_value[:3]);size=256
  yy,xx=np.mgrid[0:size,0:size];rng=np.random.default_rng(42)
  weave=1+.028*np.sin(xx*pi/2)*np.cos(yy*pi/2)+.012*rng.standard_normal((size,size))+.012*np.sin((xx+yy)*.28)
  linear=np.clip(weave[...,None]*base,0,1);rgb=np.where(linear<=.0031308,12.92*linear,1.055*linear**(1/2.4)-.055)
  pixels=np.ones((size,size,4),dtype=np.float32);pixels[:,:,:3]=rgb
  im=bpy.data.images.new('Woven_'+key,width=size,height=size);im.pixels.foreach_set(pixels.ravel());im.pack()
  tx=mat.node_tree.nodes.new('ShaderNodeTexImage');tx.image=im;mat.node_tree.links.new(tx.outputs['Color'],bs.inputs['Base Color']);bs.inputs['Roughness'].default_value=.88
  bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob;bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(island_margin=.015);bpy.ops.object.mode_set(mode='OBJECT')
  # Broad, shallow folds break up the polo silhouette at the waist.
  if key=='cf2037':
   for ve in ob.data.vertices:
    x,y,z=ve.co;amount=.0045*sin(z*67+x*18)*math.exp(-((z-1.06)/.19)**2);ve.co.y+=amount*(1 if y>0 else -1)
 elif key in ['c98f68','68412b','805139']:
  base=bs.inputs['Base Color'].default_value[:3];attr=ob.data.color_attributes.new(name='SurfaceTone',type='FLOAT_COLOR',domain='POINT')
  for ve in ob.data.vertices:
   x,y,z=ve.co;variation=1+.018*sin(x*37+z*19)
   col=[c*variation for c in base]
   if key=='c98f68':
    cheek=math.exp(-((abs(x)-.125)/.055)**2-((z-1.72)/.06)**2)*max(0,min(1,(y-.1)*10))
    col[0]*=1+.07*cheek;col[1]*=1-.065*cheek;col[2]*=1-.035*cheek
   else:
    tone=.86+.14*(.5+.5*sin(x*110+z*12));col=[c*tone for c in col]
   attr.data[ve.index].color=(*col,1)
  vc=mat.node_tree.nodes.new('ShaderNodeVertexColor');vc.layer_name='SurfaceTone';mat.node_tree.links.new(vc.outputs['Color'],bs.inputs['Base Color']);bs.inputs['Roughness'].default_value=.72
bpy.ops.object.select_all(action='DESELECT');scene=bpy.context.scene;scene.render.fps=30;arm.animation_data_create()
def rot(name,x=0,y=0,z=0):
 p=arm.pose.bones[name];rest=adata.bones[name].matrix_local.to_quaternion();q=Quaternion((0,-1,0),z)@Quaternion((0,0,1),y)@Quaternion((1,0,0),x);p.rotation_mode='QUATERNION';p.rotation_quaternion=rest.inverted()@q@rest
clips={}
for clip,length in [('Idle',60),('Run',24),('Jump',24),('Roll',26),('Stumble',24),('Deliver',60),('Celebrate',60)]:
 action=bpy.data.actions.new(clip);action.use_fake_user=True;arm.animation_data.action=action
 for f in range(length+1):
  t=f/length;ph=t*2*pi
  for p in arm.pose.bones:p.rotation_mode='QUATERNION';p.rotation_quaternion=Quaternion();p.location=(0,0,0)
  if clip=='Idle':rot('spine',sin(ph)*.016);rot('head',0,sin(ph)*.05)
  if clip=='Run':
   rot('hips',0,sin(ph)*.035,sin(ph)*.024);rot('spine',-.085,-sin(ph)*.065,-sin(ph)*.016);rot('head',.06,sin(ph)*.025);rot('pack',sin(ph*2-.65)*.025,0,sin(ph-.3)*.025)
   for side,off in [('L',0),('R',pi)]:
    s=sin(ph+off);rot('thigh_'+side,s*.65);rot('shin_'+side,-max(0,sin(ph+off-.28))*1.20);rot('foot_'+side,max(0,s)*.25-.08*cos(ph+off));rot('upper_'+side,-s*.43,0,(-1 if side=='L' else 1)*.08);rot('fore_'+side,.95+cos(ph+off-.3)*.14);rot('hand_'+side,.05*sin(ph+off))
  if clip=='Jump':
   u=sin(pi*t);rot('spine',-.12*u)
   for side in ['L','R']:rot('thigh_'+side,.50*u);rot('shin_'+side,-.85*u);rot('upper_'+side,.5*u);rot('fore_'+side,.8)
  if clip=='Roll':
   u=min(clamp(t/.12),clamp((1-t)/.15));u=u*u*(3-2*u);r=clamp((t-.1)/.76);r=r*r*(3-2*r);rot('hips',-2*pi*r);rot('spine',-.18*u);rot('head',.55*u)
   for side in ['L','R']:rot('thigh_'+side,-1.9*u);rot('shin_'+side,2.2*u);rot('upper_'+side,-1.5*u);rot('fore_'+side,-.75-.85*u)
  if clip=='Deliver':
   u=clamp(t/.32);u=u*u*(3-2*u);reach=sin(pi*clamp((t-.28)/.72))
   rot('spine',-.055*u);rot('head',-.06*u)
   for side in ['L','R']:rot('upper_'+side,.38*u+.18*reach,0,(-1 if side=='L' else 1)*.04);rot('fore_'+side,.98*u-.24*reach)
  if clip=='Celebrate':
   u=clamp(t/.24);u=u*u*(3-2*u);rot('spine',sin(ph)*.018);rot('head',-.04*u,sin(ph)*.05)
   for side in ['L','R']:rot('upper_'+side,(1.65+.08*sin(ph))*u,0,(-1 if side=='L' else 1)*.25*u);rot('fore_'+side,.55*u)
  if clip=='Stumble':
   u=t*t*(3-2*t);rot('hips',-.12*u,0,-1.25*u)
   for side in ['L','R']:rot('upper_'+side,-.65*u);rot('fore_'+side,-.8);rot('shin_'+side,.5*u)
  for p in arm.pose.bones:p.keyframe_insert('rotation_quaternion',frame=f+1,group=p.name);p.keyframe_insert('location',frame=f+1,group=p.name)
 for fc in action.fcurves:
  for k in fc.keyframe_points:k.interpolation='LINEAR'
 track=arm.animation_data.nla_tracks.new();track.name=clip;track.strips.new(clip,1,action);track.mute=True;clips[clip]=length/30
arm.animation_data.action=None
for p in arm.pose.bones:p.rotation_quaternion=Quaternion();p.location=(0,0,0)
scene.frame_set(1);os.makedirs(OUT,exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=ROOT+'/tools/character/mostaza-runner.blend')
opts=dict(filepath=OUT+'/mostaza-runner.glb',export_format='GLB',export_yup=True,export_animations=True,export_animation_mode='ACTIONS',export_skins=True,export_force_sampling=True,export_frame_range=False,export_materials='EXPORT',export_cameras=False,export_lights=False)
bpy.ops.export_scene.gltf(**opts)
json.dump({'clips':clips,'authoring':'Blender 4.3.2','originalAsset':True},open(OUT+'/character.json','w'),indent=2)
print('CHARACTER_EXPORTED',os.path.getsize(OUT+'/mostaza-runner.glb'),flush=True)
