const Divider = (props: any) => {
  return <div className="divider">
    <div>
      <div>
        <div></div>
      </div>
      <div>
        <span>{props.children}</span>
      </div>
    </div>
  </div>;
}

export default Divider;