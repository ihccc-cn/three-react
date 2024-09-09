import * as THREE from 'three';

type TActionStore = Record<
  string,
  { weight: number; action?: THREE.AnimationAction }
>;

class CreateAnimation {
  currentAction: string;
  allActions: THREE.AnimationAction[];
  baseActions: TActionStore;
  poseActions: TActionStore;
  mixer?: THREE.AnimationMixer;
  size: number = 0;

  constructor(currentAction?: string) {
    this.currentAction = currentAction || 'None';
    this.allActions = [];
    this.baseActions = {};
    this.poseActions = {};
  }

  add(name: string, type?: 'pose' | 'base') {
    const weight = name === this.currentAction ? 1 : 0;
    if (type === 'pose') {
      this.poseActions[name] = { weight };
    } else {
      this.baseActions[name] = { weight };
    }
  }

  // addSkeletonHelper(scene: THREE.Scene) {
  //   const skeleton = new THREE.SkeletonHelper(model);
  //   skeleton.visible = true;
  //   scene.add(skeleton);
  // }

  createByGltf(gltf: any) {
    const animations = gltf.animations;
    this.mixer = new THREE.AnimationMixer(gltf.scene);
    this.size = animations.length;

    for (let i = 0; i !== this.size; ++i) {
      let clip = animations[i];
      const name = clip.name;

      if (this.baseActions[name]) {
        const action = this.mixer.clipAction(clip);
        this.activateAction(action);
        this.baseActions[name].action = action;
        this.allActions.push(action);
      } else if (this.poseActions[name]) {
        // THREE.AnimationUtils.makeClipAdditive(clip);
        // if (clip.name.endsWith('_pose')) {
        //   clip = THREE.AnimationUtils.subclip(clip, clip.name, 2, 3, 30);
        // }
        // const action = this.mixer.clipAction(clip);
        // activateAction(action);
        // this.poseActions[name].action = action;
        // this.allActions.push(action);
      }
    }
  }

  play(name: string, duration: number = 0.25) {
    const currentAction = this.baseActions[this.currentAction]?.action;
    const action = this.baseActions[name]?.action;

    if (currentAction !== action) {
      this.prepareCrossFade(currentAction, action, duration);
    }
  }

  prepareCrossFade(
    startAction: THREE.AnimationAction | undefined,
    endAction: THREE.AnimationAction | undefined,
    duration: number,
  ) {
    // If the current action is 'idle', execute the crossfade immediately;
    // else wait until the current action has finished its current loop
    if (this.currentAction === 'idle' || !startAction || !endAction) {
      executeCrossFade(startAction, endAction, duration);
    } else {
      this.synchronizeCrossFade(startAction, endAction, duration);
    }

    // Update control colors
    if (endAction) {
      const clip = endAction.getClip();
      this.currentAction = clip.name;
    } else {
      this.currentAction = 'None';
    }

    // crossFadeControls.forEach(function (control) {
    //   const name = control.property;
    //   if (name === this.currentAction) {
    //     control.setActive();
    //   } else {
    //     control.setInactive();
    //   }
    // });
  }

  synchronizeCrossFade(
    startAction: THREE.AnimationAction,
    endAction: THREE.AnimationAction,
    duration: number,
  ) {
    if (!this.mixer) return;
    const onLoopFinished = (event: any) => {
      if (this.mixer && event.action === startAction) {
        this.mixer.removeEventListener('loop', onLoopFinished);
        executeCrossFade(startAction, endAction, duration);
      }
    };
    this.mixer.addEventListener('loop', onLoopFinished);
  }

  activateAction(action: THREE.AnimationAction) {
    const clip = action.getClip();
    const settings = this.baseActions[clip.name] || this.poseActions[clip.name];
    setWeight(action, settings.weight);
    action.play();
  }
  /** 动画更新 */
  update(deltaTime: number) {
    if (!this.mixer) return;
    for (let i = 0; i !== this.size; ++i) {
      const action = this.allActions[i];
      const clip = action.getClip();
      const settings =
        this.baseActions[clip.name] || this.poseActions[clip.name];
      settings.weight = action.getEffectiveWeight();
    }
    // 更新动画混合器
    this.mixer.update(deltaTime);
  }
}

function executeCrossFade(
  startAction: THREE.AnimationAction | undefined,
  endAction: THREE.AnimationAction | undefined,
  duration: number,
) {
  // Not only the start action, but also the end action must get a weight of 1 before fading
  // (concerning the start action this is already guaranteed in this place)
  if (endAction) {
    setWeight(endAction, 1);
    endAction.time = 0;
    if (startAction) {
      // Crossfade with warping
      startAction.crossFadeTo(endAction, duration, true);
    } else {
      endAction.fadeIn(duration);
    }
  } else if (!!startAction) {
    startAction.fadeOut(duration);
  }
}

function setWeight(action: THREE.AnimationAction, weight: number) {
  action.enabled = true;
  action.setEffectiveTimeScale(1);
  action.setEffectiveWeight(weight);
}

export default CreateAnimation;
