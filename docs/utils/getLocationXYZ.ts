const center = { lng: 120.370315, lat: 31.496916 };

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

function getScaleFactor(zoom: number): number {
  return zoom;
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // 地球半径，单位为公里
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getLocationXYZ(
  location: { lng: number; lat: number },
  zoom: number,
): [number, number, number] {
  const deltaLat = location.lat - center.lat;
  // const deltaLng = location.lng - center.lng;

  // 使用 deltaLat 来近似计算纬度方向上的距离
  const distanceLat = deltaLat * (Math.PI / 180) * 6371;

  // 经度方向上的距离保持不变
  const distanceLng = calculateDistance(
    center.lat,
    center.lng,
    location.lat,
    location.lng,
  );

  const scaleFactor = getScaleFactor(zoom);

  // 转换为 Three.js 坐标系
  // 注意：这里假设 y 轴表示高度，x 轴表示东西方向，z 轴表示南北方向
  // 并且 y 轴正方向朝上，x 轴正方向朝东，z 轴正方向朝北
  const x = -distanceLng * scaleFactor;
  const y = 0; // 假设所有点都在同一高度
  const z = -distanceLat * scaleFactor;

  return [x, y, z];
}

// 示例调用
// const location = { lng: 120.371315, lat: 31.506916 };
// const zoom = 15;
// console.log(getLocationXYZ(location, zoom));

export default getLocationXYZ;
