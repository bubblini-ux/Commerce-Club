/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CasinoSceneContext, TableTargets } from './casinoScene';

export interface ControlsManager {
  setActiveTable: (table: keyof TableTargets) => void;
  getActiveTable: () => keyof TableTargets;
  spinRouletteWheel: (winningNumber: number, onComplete: () => void) => void;
  spinSlots: (durationMs: number, onComplete: () => void) => void;
  destroy: () => void;
}

export function setupControls(
  context: CasinoSceneContext,
  container: HTMLDivElement,
  onTableChange: (table: keyof TableTargets) => void
): ControlsManager {
  const { renderer, scene, camera, isSoftwareGl, tableTargets, rouletteWheelMesh, rouletteBallMesh, csPreviewGroup, slotReels } = context;

  let activeTable: keyof TableTargets = 'floor';
  let targetCamPos = tableTargets.floor.position.clone();
  let targetLookAt = tableTargets.floor.lookAt.clone();
  const currentLookAt = tableTargets.floor.lookAt.clone();

  // Floor walking state
  const playerPos = new THREE.Vector3(0, 3.2, 9.5);
  let playerYaw = 0;
  let isPointerDown = false;
  let prevPointerX = 0;
  let prevPointerY = 0;

  // Key states
  const heldKeys = {
    KeyW: false,
    KeyS: false,
    KeyA: false,
    KeyD: false,
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
  };

  // Raycaster for clicking tables on the casino floor
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // Animation states for games
  let rouletteSpinning = false;
  let rouletteSpeed = 0;
  let ballAngle = 0;
  let ballRadius = 0.78;
  let onRouletteComplete: (() => void) | null = null;

  let slotsSpinning = false;
  let slotsEndTime = 0;
  let onSlotsComplete: (() => void) | null = null;

  // Window & Input event listeners
  function onKeyDown(e: KeyboardEvent) {
    if (e.code in heldKeys) {
      heldKeys[e.code as keyof typeof heldKeys] = true;
    }
    if (e.code === 'Escape' && activeTable !== 'floor') {
      setActiveTable('floor');
    }
  }

  function onKeyUp(e: KeyboardEvent) {
    if (e.code in heldKeys) {
      heldKeys[e.code as keyof typeof heldKeys] = false;
    }
  }

  function onBlur() {
    Object.keys(heldKeys).forEach((k) => {
      heldKeys[k as keyof typeof heldKeys] = false;
    });
    isPointerDown = false;
  }

  function onPointerDown(e: PointerEvent) {
    isPointerDown = true;
    prevPointerX = e.clientX;
    prevPointerY = e.clientY;
  }

  function onPointerMove(e: PointerEvent) {
    if (!isPointerDown) return;
    const dx = e.clientX - prevPointerX;
    prevPointerX = e.clientX;
    prevPointerY = e.clientY;

    if (activeTable === 'floor') {
      playerYaw -= dx * 0.004;
    }
  }

  function onPointerUp(e: PointerEvent) {
    const wasDragging = Math.hypot(e.clientX - prevPointerX, e.clientY - prevPointerY) > 5;
    isPointerDown = false;

    // Table click raycasting (only when not dragging camera)
    if (!wasDragging && activeTable === 'floor') {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const testObjects = context.interactiveMeshes.map((m) => m.mesh);
      const intersects = raycaster.intersectObjects(testObjects, true);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const found = context.interactiveMeshes.find((item) => {
          let cur: THREE.Object3D | null = hit;
          while (cur) {
            if (cur === item.mesh) return true;
            cur = cur.parent;
          }
          return false;
        });

        if (found) {
          setActiveTable(found.tableName);
        }
      }
    }
  }

  function onResize() {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', onBlur);
  container.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('resize', onResize);

  function setActiveTable(table: keyof TableTargets) {
    activeTable = table;
    const target = tableTargets[table];
    targetCamPos = target.position.clone();
    targetLookAt = target.lookAt.clone();
    onTableChange(table);
  }

  function getActiveTable(): keyof TableTargets {
    return activeTable;
  }

  function spinRouletteWheel(winningNumber: number, onComplete: () => void) {
    rouletteSpinning = true;
    rouletteSpeed = 9.5; // Fast initial spin
    ballAngle = Math.random() * Math.PI * 2;
    ballRadius = 0.85;
    onRouletteComplete = onComplete;
  }

  function spinSlots(durationMs: number, onComplete: () => void) {
    slotsSpinning = true;
    slotsEndTime = performance.now() + durationMs;
    onSlotsComplete = onComplete;
  }

  // Continuous 60fps Game Loop with Software WebGL afterDraw handling
  let frameId = 0;
  let lastTime = performance.now();

  function afterDraw(cb: () => void) {
    const gl = renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        frameId = window.setTimeout(poll, 5);
      } else {
        gl.deleteSync(sync);
        frameId = window.setTimeout(cb, 80);
      }
    };
    frameId = window.setTimeout(poll, 5);
  }

  function tick() {
    const now = performance.now();
    const rawDt = (now - lastTime) / 1000;
    lastTime = now;
    const dt = Math.min(rawDt, 0.05); // Clamped delta time

    // 1. Update Floor Walking Movement (only in floor mode)
    if (activeTable === 'floor') {
      const moveSpeed = 6.0;
      let forward = 0;
      let strafe = 0;

      if (heldKeys.KeyW || heldKeys.ArrowUp) forward -= 1;
      if (heldKeys.KeyS || heldKeys.ArrowDown) forward += 1;
      if (heldKeys.KeyA || heldKeys.ArrowLeft) strafe -= 1;
      if (heldKeys.KeyD || heldKeys.ArrowRight) strafe += 1;

      if (forward !== 0 || strafe !== 0) {
        const length = Math.hypot(forward, strafe);
        forward /= length;
        strafe /= length;

        const sinY = Math.sin(playerYaw);
        const cosY = Math.cos(playerYaw);

        playerPos.x += (forward * sinY + strafe * cosY) * moveSpeed * dt;
        playerPos.z += (forward * cosY - strafe * sinY) * moveSpeed * dt;

        // Boundaries inside Commerce Casino floor
        playerPos.x = Math.max(-12, Math.min(12, playerPos.x));
        playerPos.z = Math.max(-11, Math.min(13, playerPos.z));
      }

      targetCamPos.set(playerPos.x, playerPos.y, playerPos.z);
      targetLookAt.set(
        playerPos.x - Math.sin(playerYaw) * 6,
        playerPos.y - 0.5,
        playerPos.z - Math.cos(playerYaw) * 6
      );
    }

    // 2. Exponentially Damped Camera Transitions (Smooth Momentum)
    const dampRate = activeTable === 'floor' ? 12 : 6;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamPos.x, dampRate, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamPos.y, dampRate, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamPos.z, dampRate, dt);

    currentLookAt.x = THREE.MathUtils.damp(currentLookAt.x, targetLookAt.x, dampRate, dt);
    currentLookAt.y = THREE.MathUtils.damp(currentLookAt.y, targetLookAt.y, dampRate, dt);
    currentLookAt.z = THREE.MathUtils.damp(currentLookAt.z, targetLookAt.z, dampRate, dt);
    camera.lookAt(currentLookAt);

    // 3. CS Hologram Weapon Rotation (Constant showcase float)
    if (csPreviewGroup) {
      csPreviewGroup.rotation.y += 0.8 * dt;
      csPreviewGroup.position.y = 1.8 + Math.sin(now * 0.0025) * 0.08;
    }

    // 4. Roulette Wheel & Ball Simulation
    if (rouletteWheelMesh) {
      if (rouletteSpinning) {
        rouletteWheelMesh.rotation.y += rouletteSpeed * dt;
        rouletteSpeed = Math.max(0.2, rouletteSpeed - dt * 1.6);

        // Ball orbits opposite direction
        ballAngle -= (rouletteSpeed * 1.5 + 2.0) * dt;
        ballRadius = Math.max(0.68, ballRadius - dt * 0.035);

        if (rouletteBallMesh) {
          rouletteBallMesh.position.x = -1.6 + Math.cos(ballAngle) * ballRadius;
          rouletteBallMesh.position.z = 0 + Math.sin(ballAngle) * ballRadius;
          rouletteBallMesh.position.y = 1.5 + (ballRadius < 0.72 ? Math.abs(Math.sin(now * 0.02)) * 0.02 : 0);
        }

        if (rouletteSpeed <= 0.25) {
          rouletteSpinning = false;
          if (onRouletteComplete) {
            onRouletteComplete();
            onRouletteComplete = null;
          }
        }
      } else {
        // Idle ambient slow rotation
        rouletteWheelMesh.rotation.y += 0.08 * dt;
      }
    }

    // 5. Slot Reels Animation
    if (slotsSpinning) {
      slotReels.forEach((group) => {
        group.children.forEach((reel, i) => {
          reel.rotation.x += (18 + i * 2) * dt;
        });
      });

      if (now >= slotsEndTime) {
        slotsSpinning = false;
        if (onSlotsComplete) {
          onSlotsComplete();
          onSlotsComplete = null;
        }
      }
    }

    // Render Scene
    renderer.render(scene, camera);

    if (isSoftwareGl) {
      afterDraw(tick);
    } else {
      frameId = requestAnimationFrame(tick);
    }
  }

  // Start loop
  if (isSoftwareGl) {
    afterDraw(tick);
  } else {
    frameId = requestAnimationFrame(tick);
  }

  return {
    setActiveTable,
    getActiveTable,
    spinRouletteWheel,
    spinSlots,
    destroy: () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);
    },
  };
}
