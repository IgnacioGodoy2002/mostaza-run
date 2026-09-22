import bpy,os,math
from mathutils import Vector
ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),'../..'))
bpy.ops.wm.open_mainfile(filepath=ROOT+'/tools/character/mostaza-runner.blend')
scene=bpy.context.scene
scene.render.engine='CYCLES';scene.cycles.samples=12;scene.cycles.use_denoising=True
scene.render.resolution_x=600;scene.render.resolution_y=760;scene.render.resolution_percentage=100
scene.world.color=(.19,.19,.19)
scene.view_settings.view_transform='AgX'
bpy.ops.mesh.primitive_plane_add(size=200);floor=bpy.context.object
m=bpy.data.materials.new('Studio floor');m.diffuse_color=(.17,.19,.20,1);floor.data.materials.append(m)
def v(p):return Vector((p[0],-p[2],p[1]))
for name,pos,power,size in [('Key',(-3,5,-4),500,4),('Fill',(3,3,-2),200,3),('Rim',(1,4,3),650,3)]:
 d=bpy.data.lights.new(name,'AREA');d.energy=power;d.shape='DISK';d.size=size;o=bpy.data.objects.new(name,d);scene.collection.objects.link(o);o.location=v(pos);o.rotation_euler=(v((0,1,0))-o.location).to_track_quat('-Z','Y').to_euler()
d=bpy.data.cameras.new('Review');camera=bpy.data.objects.new('Review',d);scene.collection.objects.link(camera);scene.camera=camera;d.type='ORTHO';d.ortho_scale=2.65
for name,pos in [('run',(3,2.1,5)),('front',(3,2.1,-5)),('delivery',(3,2.1,-5)),('celebrate',(3,2.1,-5))]:
 arm=bpy.data.objects['Mostaza_Rig'];arm.animation_data.action=bpy.data.actions[{'run':'Run','front':'Idle','delivery':'Deliver','celebrate':'Celebrate'}[name]];scene.frame_set(9 if name=='run' else 32)
 camera.location=v(pos);camera.rotation_euler=(v((0,1.12,0))-camera.location).to_track_quat('-Z','Y').to_euler();scene.render.filepath='/workspace/scratch/0ce0ad39c192/character-'+name+'.png';bpy.ops.render.render(write_still=True)
