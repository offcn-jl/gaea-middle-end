import React from 'react';

export const notificationDescription = (status: number, url: string, error: string) => {
  return (
    <div>
      状态码: {status}
      <br />
      接口: {url}
      <br />
      {error ? `详情: ${error}` : ''}
    </div>
  );
};
