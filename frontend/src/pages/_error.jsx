import MainLayout from '../components/Layouts/MainLayout';

function Error({ statusCode }) {
  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-4">
        {statusCode
          ? `An error ${statusCode} occurred on server`
          : 'An error occurred on client'}
      </h1>
      <p>Sorry, something went wrong.</p>
    </MainLayout>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;